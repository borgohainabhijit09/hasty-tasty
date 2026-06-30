import express, { Request, Response } from "express";
import cors from "cors";
import { prisma } from "database";
import { Pool, PoolClient } from "pg";
import type { Category, ProductImage, PricingTier } from "@prisma/client";

// Trigger restart for database changes - limit 4
const app = express();

const pool = new Pool({
  connectionString: (process.env.DATABASE_URL || "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres").split('?')[0],
  ssl: {
    rejectUnauthorized: false
  },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function runTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 100): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const isTransient =
        error?.code === 'P1017' ||
        error?.code === 'P2024' ||
        String(error).includes('Server has closed the connection') ||
        String(error).includes('ConnectionReset') ||
        String(error).includes('socket') ||
        String(error).includes('conn');
      
      if (isTransient && attempt < retries) {
        console.warn(`[DATABASE RETRY] Transient error encountered (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Retry failed");
}

app.use(cors());
app.use(express.json());

// ── HEALTH CHECK ──
app.get("/", (_req: Request, res: Response) => {
  res.send("Hasty Tasty API Running");
});

// ── CATEGORIES ──
app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const { b2c, b2b } = req.query;
    let query = `
      SELECT 
        c.*, 
        COUNT(DISTINCT pc."productId") as product_count 
      FROM "Category" c 
      LEFT JOIN "ProductCategory" pc ON c.id = pc."categoryId" 
      LEFT JOIN "Product" p ON pc."productId" = p.id AND p."isActive" = true
    `;
    const conditions: string[] = [];
    if (b2c === "true") {
      conditions.push(`c."isB2C" = true`);
      query = `
        SELECT 
          c.*, 
          COUNT(DISTINCT pc."productId") as product_count 
        FROM "Category" c 
        LEFT JOIN "ProductCategory" pc ON c.id = pc."categoryId" 
        LEFT JOIN "Product" p ON pc."productId" = p.id AND p."isActive" = true
      `;
    }
    if (b2b === "true") {
      conditions.push(`c."isB2B" = true`);
      query = `
        SELECT 
          c.*, 
          COUNT(DISTINCT pc."productId") as product_count 
        FROM "Category" c 
        LEFT JOIN "ProductCategory" pc ON c.id = pc."categoryId" 
        LEFT JOIN "Product" p ON pc."productId" = p.id AND p."isActive" = true
      `;
    }
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }
    
    query += ` GROUP BY c.id ORDER BY c.name ASC`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("FATAL ERROR IN /api/categories:", error);
    res.status(500).json({ error: "Failed to fetch categories", details: String(error) });
  }
});

app.post("/api/categories", async (req: Request, res: Response) => {
  try {
    const { name, slug, description, imageUrl, isActive, isB2C, isB2B } = req.body;
    // Basic validation
    if (!name || !slug) return res.status(400).json({ error: "Name and slug are required" });

    // Generate id using simple random or just use default cuid() via Prisma if we were using it.
    // Since we are using raw SQL, we can let Prisma's default handle it, but wait:
    // Raw SQL INSERT doesn't auto-execute Prisma's cuid(). We must generate one or use uuid.
    // Let's generate a simple string id if not using Prisma Client.
    const cuid = 'c' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    const result = await pool.query(`
      INSERT INTO "Category" (id, name, slug, description, "imageUrl", "isActive", "isB2C", "isB2B") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [
      cuid, name, slug, description || null, imageUrl || null, 
      isActive !== undefined ? isActive : true,
      isB2C !== undefined ? isB2C : true,
      isB2B !== undefined ? isB2B : false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("FATAL ERROR IN POST /api/categories:", error);
    return res.status(500).json({ error: "Failed to create category", details: String(error) });
  }
});

// ── CATEGORIES BULK DELETE ──
app.delete("/api/categories/bulk", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs must be a non-empty array" });
    }
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "ProductCategory" WHERE "categoryId" = ANY($1)`, [ids]);
      return await client.query(`DELETE FROM "Category" WHERE id = ANY($1) RETURNING *`, [ids]);
    });
    return res.json({ message: `${result.rowCount} categories deleted successfully` });
  } catch (error) {
    console.error("Error in bulk delete categories:", error);
    return res.status(500).json({ error: "Failed to delete categories", details: String(error) });
  }
});

app.delete("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "ProductCategory" WHERE "categoryId" = $1`, [id]);
      return await client.query(`DELETE FROM "Category" WHERE id = $1 RETURNING *`, [id]);
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("FATAL ERROR IN DELETE /api/categories/:id:", error);
    res.status(500).json({ error: "Failed to delete category", details: String(error) });
  }
});

app.put("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, isActive, isB2C, isB2B } = req.body;
    
    if (!name || !slug) return res.status(400).json({ error: "Name and slug are required" });

    const result = await pool.query(`
      UPDATE "Category" 
      SET name = $1, slug = $2, description = $3, "imageUrl" = $4, "isActive" = $5, "isB2C" = $6, "isB2B" = $7 
      WHERE id = $8 
      RETURNING *
    `, [
      name, slug, description || null, imageUrl || null, 
      isActive !== undefined ? isActive : true, 
      isB2C !== undefined ? isB2C : true,
      isB2B !== undefined ? isB2B : false,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("FATAL ERROR IN PUT /api/categories/:id:", error);
    res.status(500).json({ error: "Failed to update category", details: String(error) });
  }
});

// ── PRODUCTS ──
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    console.log("REQUEST RECEIVED: GET /api/products");
    console.log("QUERY PARAMS", req.query);

    const { category, b2b, b2c, search } = req.query;

    let query = `
      SELECT 
        p.*,
        (
          SELECT json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'description', c.description)
          FROM "Category" c 
          JOIN "ProductCategory" pc ON c.id = pc."categoryId"
          WHERE pc."productId" = p.id
          LIMIT 1
        ) AS category,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'description', c.description))
            FROM "Category" c
            JOIN "ProductCategory" pc ON c.id = pc."categoryId"
            WHERE pc."productId" = p.id
          ),
          '[]'::json
        ) AS categories,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', pi.id, 'productId', pi."productId", 'url', pi.url, 'isPrimary', pi."isPrimary"))
            FROM "ProductImage" pi 
            WHERE pi."productId" = p.id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', pt.id, 'productId', pt."productId", 'minQty', pt."minQty", 'maxQty', pt."maxQty", 'price', pt.price))
            FROM "PricingTier" pt 
            WHERE pt."productId" = p.id
          ),
          '[]'::json
        ) AS "pricingTiers"
      FROM "Product" p
    `;

    const conditions: string[] = [];
    const params: string[] = [];

    if (category) {
      conditions.push(`p.id IN (SELECT "productId" FROM "ProductCategory" pc JOIN "Category" c ON pc."categoryId" = c.id WHERE c.slug = $${conditions.length + 1})`);
      params.push(String(category));
    }

    if (search) {
      conditions.push(`p.name ILIKE $${conditions.length + 1}`);
      params.push(`%${search}%`);
    }

    if (b2b === "true") {
      conditions.push(`(p."b2bPrice" IS NOT NULL OR EXISTS (SELECT 1 FROM "ProductCategory" pc2 JOIN "Category" c2 ON pc2."categoryId" = c2.id WHERE pc2."productId" = p.id AND c2."isB2B" = true))`);
    }

    if (b2c === "true") {
      conditions.push(`EXISTS (SELECT 1 FROM "ProductCategory" pc2 JOIN "Category" c2 ON pc2."categoryId" = c2.id WHERE pc2."productId" = p.id AND c2."isB2C" = true)`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    console.log("DB QUERY START: raw SQL findMany");
    const result = await pool.query(query, params);
    const products = result.rows;

    console.log("SENDING SUCCESS RESPONSE:", products.length, "products");
    return res.json(products);
  } catch (error) {
    console.error("FATAL ERROR IN /api/products:", error);
    return res.status(500).json({ error: "Failed to fetch products", details: String(error) });
  }
});

// ── SINGLE PRODUCT ──
app.get("/api/products/:slug", async (req: Request, res: Response) => {
  try {
    console.log("REQUEST RECEIVED: GET /api/products/:slug");
    const slug = String(req.params.slug);
    console.log("SLUG PARAM:", slug);

    const query = `
      SELECT 
        p.*,
        (
          SELECT json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'description', c.description)
          FROM "Category" c 
          JOIN "ProductCategory" pc ON c.id = pc."categoryId"
          WHERE pc."productId" = p.id
          LIMIT 1
        ) AS category,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'description', c.description))
            FROM "Category" c
            JOIN "ProductCategory" pc ON c.id = pc."categoryId"
            WHERE pc."productId" = p.id
          ),
          '[]'::json
        ) AS categories,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', pi.id, 'productId', pi."productId", 'url', pi.url, 'isPrimary', pi."isPrimary"))
            FROM "ProductImage" pi 
            WHERE pi."productId" = p.id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', pt.id, 'productId', pt."productId", 'minQty', pt."minQty", 'maxQty', pt."maxQty", 'price', pt.price))
            FROM "PricingTier" pt 
            WHERE pt."productId" = p.id
          ),
          '[]'::json
        ) AS "pricingTiers",
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', r.id, 'userId', r."userId", 'productId', r."productId", 'rating', r.rating, 'comment', r.comment, 'createdAt', r."createdAt"))
            FROM "Review" r 
            WHERE r."productId" = p.id
          ),
          '[]'::json
        ) AS reviews
      FROM "Product" p
      WHERE p.slug = $1
      LIMIT 1
    `;

    console.log("DB QUERY START: raw SQL findUnique by slug");
    const result = await pool.query(query, [slug]);
    const products = result.rows;

    if (!products || products.length === 0) {
      console.log("PRODUCT NOT FOUND:", slug);
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[0];
    console.log("SENDING SUCCESS RESPONSE");
    return res.json(product);
  } catch (error) {
    console.error("FATAL ERROR IN /api/products/:slug:", error);
    return res.status(500).json({ error: "Failed to fetch product", details: String(error) });
  }
});

app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const { name, slug, sku, description, basePrice, b2bPrice, stock, categoryIds, isActive, imageUrl } = req.body;
    if (!name || !slug || basePrice === undefined) {
      return res.status(400).json({ error: "Name, slug, and basePrice are required" });
    }

    const cuid = 'p' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    const product = await runTransaction(async (client) => {
      const result = await client.query(`
        INSERT INTO "Product" (id, name, slug, sku, description, "basePrice", "b2bPrice", stock, "isActive", "updatedAt") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
        RETURNING *
      `, [cuid, name, slug, sku || null, description || '', basePrice, b2bPrice !== '' && b2bPrice !== undefined && b2bPrice !== null ? Number(b2bPrice) : null, stock || 0, isActive !== undefined ? isActive : true]);

      if (categoryIds && Array.isArray(categoryIds)) {
        for (const catId of categoryIds) {
          await client.query(`
            INSERT INTO "ProductCategory" ("productId", "categoryId")
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [cuid, catId]);
        }
      }

      if (imageUrl) {
        const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
        await client.query(`
          INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
          VALUES ($1, $2, $3, true)
        `, [imageId, cuid, imageUrl]);
      }
      
      return result.rows[0];
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("FATAL ERROR IN POST /api/products:", error);
    res.status(500).json({ error: "Failed to create product", details: String(error) });
  }
});

  app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, sku, description, basePrice, b2bPrice, stock, categoryIds, isActive, imageUrl } = req.body;
    
    if (!name && !categoryIds) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const product = await runTransaction(async (client) => {
      let result;
      if (name) {
        result = await client.query(`
          UPDATE "Product" 
          SET name = $1, slug = $2, sku = $3, description = $4, "basePrice" = $5, "b2bPrice" = $6, stock = $7, "isActive" = $8, "updatedAt" = NOW()
          WHERE id = $9 
          RETURNING *
        `, [name, slug, sku || null, description || '', basePrice, b2bPrice !== '' && b2bPrice !== undefined && b2bPrice !== null ? Number(b2bPrice) : null, stock || 0, isActive !== undefined ? isActive : true, id]);
      } else {
        result = await client.query(`SELECT * FROM "Product" WHERE id = $1`, [id]);
      }

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }

      if (categoryIds && Array.isArray(categoryIds)) {
        await client.query(`DELETE FROM "ProductCategory" WHERE "productId" = $1`, [id]);
        for (const catId of categoryIds) {
          await client.query(`
            INSERT INTO "ProductCategory" ("productId", "categoryId")
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [id, catId]);
        }
      }

      if (imageUrl !== undefined) {
        await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [id]);
        if (imageUrl) {
          const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
          await client.query(`
            INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
            VALUES ($1, $2, $3, true)
          `, [imageId, id, imageUrl]);
        }
      }
      
      return result.rows[0];
    });

    res.json(product);
  } catch (error: any) {
    console.error("FATAL ERROR IN PUT /api/products/:id:", error);
    if (error.message === "Product not found") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to update product", details: String(error) });
  }
});

// ── PRODUCTS BULK DELETE ──
app.delete("/api/products/bulk", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs must be a non-empty array" });
    }
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "ProductCategory" WHERE "productId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "ProductImage" WHERE "productId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "PricingTier" WHERE "productId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "OrderItem" WHERE "productId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "EnquiryItem" WHERE "productId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "Review" WHERE "productId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "Wishlist" WHERE "productId" = ANY($1)`, [ids]);
      return await client.query(`DELETE FROM "Product" WHERE id = ANY($1) RETURNING *`, [ids]);
    });
    return res.json({ message: `${result.rowCount} products deleted successfully` });
  } catch (error) {
    console.error("Error in bulk delete products:", error);
    return res.status(500).json({ error: "Failed to delete products", details: String(error) });
  }
});

app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "ProductCategory" WHERE "productId" = $1`, [id]);
      await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [id]);
      await client.query(`DELETE FROM "PricingTier" WHERE "productId" = $1`, [id]);
      await client.query(`DELETE FROM "Review" WHERE "productId" = $1`, [id]);
      await client.query(`DELETE FROM "Wishlist" WHERE "productId" = $1`, [id]);
      await client.query(`DELETE FROM "OrderItem" WHERE "productId" = $1`, [id]);
      await client.query(`DELETE FROM "EnquiryItem" WHERE "productId" = $1`, [id]);
      return await client.query(`DELETE FROM "Product" WHERE id = $1 RETURNING *`, [id]);
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("FATAL ERROR IN DELETE /api/products/:id:", error);
    res.status(500).json({ error: "Failed to delete product", details: String(error) });
  }
});

// ── ORDERS ──
app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const { userId, totalAmount, taxAmount, shippingAmount, notes, addressId, items } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const order = await withRetry(() => prisma.order.create({
      data: {
        userId,
        totalAmount,
        taxAmount,
        shippingAmount,
        notes,
        addressId,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    }));

    return res.status(201).json(order);
  } catch (error) {
    console.error("FATAL ERROR IN /api/orders:", error);
    return res.status(500).json({ error: "Failed to create order", details: String(error) });
  }
});

// ── ENQUIRIES ──
app.post("/api/enquiries", async (req: Request, res: Response) => {
  try {
    const { userId, notes, expectedDate, items } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const enquiryData: {
      userId: string;
      notes?: string;
      expectedDate?: Date | null;
      items?: { create: { productId: string; quantity: number }[] };
    } = {
      userId,
      notes,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
    };

    if (items && items.length > 0) {
      enquiryData.items = {
        create: items.map((item: { productId: string; quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
    }

    const enquiry = await withRetry(() => prisma.enquiry.create({ data: enquiryData }));
    return res.status(201).json(enquiry);
  } catch (error) {
    console.error("FATAL ERROR IN /api/enquiries:", error);
    return res.status(500).json({ error: "Failed to submit enquiry", details: String(error) });
  }
});

// ── GET DASHBOARD STATS ──
app.get("/api/dashboard", async (req: Request, res: Response) => {
  try {
    const ordersRes = await pool.query(`
      SELECT o.*, u.name as customer, u.email as "customerEmail"
      FROM "Order" o
      JOIN "User" u ON o."userId" = u.id
      ORDER BY o."createdAt" DESC
    `);
    const orders = ordersRes.rows;
    
    const customersRes = await pool.query(`
      SELECT * FROM "User" WHERE role IN ('CUSTOMER', 'B2B_CUSTOMER') ORDER BY "createdAt" DESC
    `);
    const customers = customersRes.rows;
    
    const productsRes = await pool.query(`
      SELECT * FROM "Product" ORDER BY stock ASC
    `);
    const products = productsRes.rows;

    res.json({
      orders,
      customers,
      products
    });
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// ── GET ORDERS ──
app.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as customer,
        (SELECT json_agg(row_to_json(oi)) FROM "OrderItem" oi WHERE oi."orderId" = o.id) as items
      FROM "Order" o
      JOIN "User" u ON o."userId" = u.id
      ORDER BY o."createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ── UPDATE ORDER STATUS ──
app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const status = String((req.body as { status: string }).status);
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const order = await withRetry(() => prisma.order.update({
      where: { id },
      data: { status: status as any }
    }));
    
    res.json(order);
  } catch (error) {
    console.error(`FATAL ERROR IN PUT /api/orders/${req.params.id}/status:`, error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// ── ORDERS BULK DELETE ──
app.delete("/api/orders/bulk", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs must be a non-empty array" });
    }
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "OrderItem" WHERE "orderId" = ANY($1)`, [ids]);
      return await client.query(`DELETE FROM "Order" WHERE id = ANY($1) RETURNING *`, [ids]);
    });
    return res.json({ message: `${result.rowCount} orders deleted successfully` });
  } catch (error) {
    console.error("Error in bulk delete orders:", error);
    return res.status(500).json({ error: "Failed to delete orders", details: String(error) });
  }
});

// ── DELETE SINGLE ORDER ──
app.delete("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "OrderItem" WHERE "orderId" = $1`, [id]);
      return await client.query(`DELETE FROM "Order" WHERE id = $1 RETURNING *`, [id]);
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("FATAL ERROR IN DELETE /api/orders/:id:", error);
    res.status(500).json({ error: "Failed to delete order", details: String(error) });
  }
});

// ── GET CUSTOMERS ──
app.get("/api/customers", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, phone, "createdAt" 
      FROM "User" 
      WHERE role IN ('CUSTOMER', 'B2B_CUSTOMER')
      ORDER BY "createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ── CUSTOMERS BULK DELETE ──
app.delete("/api/customers/bulk", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs must be a non-empty array" });
    }
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "BusinessProfile" WHERE "userId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "Address" WHERE "userId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "Review" WHERE "userId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "Wishlist" WHERE "userId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "OrderItem" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "userId" = ANY($1))`, [ids]);
      await client.query(`DELETE FROM "Order" WHERE "userId" = ANY($1)`, [ids]);
      await client.query(`DELETE FROM "EnquiryItem" WHERE "enquiryId" IN (SELECT id FROM "Enquiry" WHERE "userId" = ANY($1))`, [ids]);
      await client.query(`DELETE FROM "Enquiry" WHERE "userId" = ANY($1)`, [ids]);
      return await client.query(`DELETE FROM "User" WHERE id = ANY($1) AND role != 'SUPER_ADMIN' RETURNING *`, [ids]);
    });
    return res.json({ message: `${result.rowCount} customers deleted successfully` });
  } catch (error) {
    console.error("Error in bulk delete customers:", error);
    return res.status(500).json({ error: "Failed to delete customers", details: String(error) });
  }
});

// ── DELETE SINGLE CUSTOMER ──
app.delete("/api/customers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "BusinessProfile" WHERE "userId" = $1`, [id]);
      await client.query(`DELETE FROM "Address" WHERE "userId" = $1`, [id]);
      await client.query(`DELETE FROM "Review" WHERE "userId" = $1`, [id]);
      await client.query(`DELETE FROM "Wishlist" WHERE "userId" = $1`, [id]);
      await client.query(`DELETE FROM "OrderItem" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "userId" = $1)`, [id]);
      await client.query(`DELETE FROM "Order" WHERE "userId" = $1`, [id]);
      await client.query(`DELETE FROM "EnquiryItem" WHERE "enquiryId" IN (SELECT id FROM "Enquiry" WHERE "userId" = $1)`, [id]);
      await client.query(`DELETE FROM "Enquiry" WHERE "userId" = $1`, [id]);
      return await client.query(`DELETE FROM "User" WHERE id = $1 AND role != 'SUPER_ADMIN' RETURNING *`, [id]);
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("FATAL ERROR IN DELETE /api/customers/:id:", error);
    res.status(500).json({ error: "Failed to delete customer", details: String(error) });
  }
});

// ── GET B2B APPLICATIONS ──
app.get("/api/b2b", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
        json_build_object('name', u.name, 'email', u.email, 'phone', u.phone) as applicant
      FROM "BusinessProfile" b
      JOIN "User" u ON b."userId" = u.id
      ORDER BY b.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/b2b:", error);
    res.status(500).json({ error: "Failed to fetch b2b applications" });
  }
});

// ── GET ENQUIRIES ──
app.get("/api/enquiries", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT e.*, 
        json_build_object('name', u.name, 'email', u.email, 'phone', u.phone) as customer
      FROM "Enquiry" e
      JOIN "User" u ON e."userId" = u.id
      ORDER BY e."createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/enquiries:", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// ── UPDATE ENQUIRY STATUS ──
app.put("/api/enquiries/:id/status", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const status = String((req.body as { status: string }).status);
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const enquiry = await withRetry(() => prisma.enquiry.update({
      where: { id },
      data: { status: status as any }
    }));
    
    res.json(enquiry);
  } catch (error) {
    console.error(`FATAL ERROR IN PUT /api/enquiries/${req.params.id}/status:`, error);
    res.status(500).json({ error: "Failed to update enquiry status" });
  }
});

// ── ENQUIRIES BULK DELETE ──
app.delete("/api/enquiries/bulk", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs must be a non-empty array" });
    }
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "EnquiryItem" WHERE "enquiryId" = ANY($1)`, [ids]);
      return await client.query(`DELETE FROM "Enquiry" WHERE id = ANY($1) RETURNING *`, [ids]);
    });
    return res.json({ message: `${result.rowCount} enquiries deleted successfully` });
  } catch (error) {
    console.error("Error in bulk delete enquiries:", error);
    return res.status(500).json({ error: "Failed to delete enquiries", details: String(error) });
  }
});

// ── DELETE SINGLE ENQUIRY ──
app.delete("/api/enquiries/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runTransaction(async (client) => {
      await client.query(`DELETE FROM "EnquiryItem" WHERE "enquiryId" = $1`, [id]);
      return await client.query(`DELETE FROM "Enquiry" WHERE id = $1 RETURNING *`, [id]);
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("FATAL ERROR IN DELETE /api/enquiries/:id:", error);
    res.status(500).json({ error: "Failed to delete enquiry", details: String(error) });
  }
});

// ── GET USERS ME ──
app.get("/api/users/me", async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const userRes = await pool.query(
      `SELECT id, name, email, role FROM "User" WHERE email = $1`,
      [email]
    );
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.json(userRes.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── BULK DELETE ENDPOINTS ──
// Moved to respective sections to prevent Express routing conflicts with :id routes.

// Trigger nodemon restart after types installation
const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`API running on port ${PORT}`);
  });
}

export default app;
