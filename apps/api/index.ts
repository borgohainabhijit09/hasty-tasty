import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { prisma } from "database";
import { Pool, PoolClient, types } from "pg";
import type { Category, ProductImage, PricingTier } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Configure pg to parse timestamp without time zone (OID 1114) as UTC
types.setTypeParser(1114, (stringValue) => new Date(stringValue + "Z"));

// Trigger restart for database changes - limit 5
const app = express();

// Fail fast at startup if the env var is missing — never ship a hardcoded credential.
if (!process.env.DATABASE_URL) {
  throw new Error('[STARTUP] DATABASE_URL environment variable is not set. Aborting.');
}

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: (connectionString.includes('localhost') || connectionString.includes('127.0.0.1') || connectionString.includes('@db:')) ? false : {
    rejectUnauthorized: false
  },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 20000,
  // Keep long-idle connections alive so Supabase's pooler doesn't silently
  // drop them and cause ECONNRESET on the next query.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle pg client', err);
});

// Prevent the process from crashing on unhandled promise rejections or
// uncaught exceptions (e.g. transient Supabase TCP drops).
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] API server will stay alive:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION] API server will stay alive:', reason);
});

/** Returns true for transient Postgres / TCP errors that are safe to retry. */
function isTransientPgError(err: any): boolean {
  return (
    err?.code === 'ECONNRESET'  ||
    err?.code === '57P01'       ||  // admin_shutdown
    err?.code === '08006'       ||  // connection_failure
    err?.code === '08001'       ||  // sqlclient_unable_to_establish_sqlconnection
    err?.code === '08004'       ||  // sqlserver_rejected_establishment_of_sqlconnection
    (typeof err?.message === 'string' && (
      err.message.includes('Connection terminated') ||
      err.message.includes('connect ECONNREFUSED') ||
      err.message.includes('read ECONNRESET')
    ))
  );
}

/**
 * Runs `callback` inside a BEGIN/COMMIT transaction with up to 3 attempts.
 * On a transient connection error a fresh client is acquired and the whole
 * transaction is retried after exponential-ish backoff (300 ms * attempt).
 */
async function runTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error: any) {
      // Always try to ROLLBACK — swallow any secondary error if the socket is dead.
      try { await client.query('ROLLBACK'); } catch (rollbackErr) {
        console.error('[runTransaction] ROLLBACK failed (connection likely dead):', rollbackErr);
      }

      const transient = isTransientPgError(error);
      if (transient && attempt < MAX_ATTEMPTS) {
        const delay = 300 * attempt;
        console.warn(
          `[runTransaction] Transient error on attempt ${attempt}/${MAX_ATTEMPTS} ` +
          `(code=${error.code}, msg="${error.message}"). Retrying in ${delay} ms…`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        // The dead client is released in finally; next loop iteration gets a fresh one.
      } else {
        throw error;  // non-transient, or exhausted retries
      }
    } finally {
      client.release();
    }
  }

  // TypeScript: this line is unreachable but satisfies the return type.
  throw new Error('[runTransaction] Exhausted all retry attempts.');
}

async function queryWithRetry(text: string, params?: any[], retries = 2): Promise<any> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (error: any) {
      const isTransient =
        error?.code === 'ECONNRESET' ||
        String(error?.message).includes('Connection terminated');
      if (isTransient && attempt <= retries) {
        console.warn(`[queryWithRetry] Transient error, retry ${attempt}/${retries}`);
        await new Promise(r => setTimeout(r, 200 * attempt));
        continue;
      }
      throw error;
    }
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 1000): Promise<T> {
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
        const nextDelay = delayMs * attempt;
        console.warn(`[DATABASE RETRY] Transient error encountered (attempt ${attempt}/${retries}). Reconnecting in ${nextDelay}ms...`);
        try { await prisma.$disconnect(); } catch(e) {}
        await new Promise((resolve) => setTimeout(resolve, nextDelay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Retry failed");
}

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// ── HEALTH CHECK ──
app.get("/", (_req: Request, res: Response) => {
  res.send("Hasty Tasty API Running");
});

// ── SETTINGS ──
app.get("/api/settings", async (req: Request, res: Response) => {
  try {
    let settings = await queryWithRetry('SELECT * FROM "StoreSettings" WHERE id = $1', ['default']);
    if (settings.rows.length === 0) {
      await queryWithRetry(`
        INSERT INTO "StoreSettings" (id, "updatedAt") 
        VALUES ($1, NOW())
      `, ['default']);
      settings = await queryWithRetry('SELECT * FROM "StoreSettings" WHERE id = $1', ['default']);
    }
    res.json(settings.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/settings", async (req: Request, res: Response) => {
  try {
    const { bannerActive, bannerTitle, bannerSubtitle, bannerText, bannerImageUrl, bannerLinkUrl } = req.body;
    await queryWithRetry(`
      UPDATE "StoreSettings" 
      SET "bannerActive" = $1, "bannerTitle" = $2, "bannerSubtitle" = $3, "bannerText" = $4, "bannerImageUrl" = $5, "bannerLinkUrl" = $6, "updatedAt" = NOW()
      WHERE id = $7
    `, [
      bannerActive !== undefined ? bannerActive : true,
      bannerTitle || "Festive Special",
      bannerSubtitle || "15% OFF",
      bannerText || "Celebrate the season with our premium handcrafted cakes and desserts. Limited time offer!",
      bannerImageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1089&auto=format&fit=crop",
      bannerLinkUrl || "/shop?category=cakes",
      'default'
    ]);
    const updated = await queryWithRetry('SELECT * FROM "StoreSettings" WHERE id = $1', ['default']);
    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update settings" });
  }
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

    const result = await queryWithRetry(query);
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
    
    const result = await queryWithRetry(`
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

    const result = await queryWithRetry(`
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
    const result = await queryWithRetry(query, params);
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
    const result = await queryWithRetry(query, [slug]);
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
    const { name, slug, sku, description, basePrice, b2bPrice, stock, categoryIds, isActive, imageUrl, images, pricingTiers } = req.body;
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

      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
          await client.query(`
            INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
            VALUES ($1, $2, $3, $4)
          `, [imageId, cuid, images[i], i === 0]);
        }
      } else if (imageUrl) {
        const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
        await client.query(`
          INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
          VALUES ($1, $2, $3, true)
        `, [imageId, cuid, imageUrl]);
      }

      if (pricingTiers && Array.isArray(pricingTiers)) {
        for (const tier of pricingTiers) {
          const tierId = 'pt' + Math.random().toString(36).substring(2, 10);
          await client.query(`
            INSERT INTO "PricingTier" (id, "productId", "minQty", "maxQty", price)
            VALUES ($1, $2, $3, $4, $5)
          `, [tierId, cuid, tier.minQty, tier.maxQty || null, tier.price]);
        }
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
  // ── STEP 1: Log incoming request ────────────────────────────────────────
  console.log("Incoming Product ID:", req.params.id);
  console.log("Incoming Payload:");
  console.dir(req.body, { depth: null });

  const { id } = req.params;

  // ── STEP 2: Schema field comparison & Guard ─────────────────────────────
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Empty request body" });
  }

  const VALID_PRODUCT_FIELDS = new Set([
    'name','slug','sku','description','ingredients','shelfLife','weight',
    'nutritionalInfo','basePrice','offerPrice','b2bPrice','stock','isActive',
    'imageUrl','categoryIds','images','pricingTiers'
  ]);
  const bodyKeys = Object.keys(req.body);
  const unknownFields = bodyKeys.filter(k => !VALID_PRODUCT_FIELDS.has(k));
  if (unknownFields.length > 0) {
    console.warn("[PUT /api/products/:id] Unknown/extra fields in body (will be ignored):", unknownFields);
  }

  // Core fields that go directly to the Product table
  const coreFields = ['name', 'slug', 'sku', 'description', 'basePrice', 'b2bPrice', 'stock', 'isActive', 'ingredients', 'shelfLife', 'weight', 'nutritionalInfo', 'offerPrice'];
  const updateFieldsPresent = bodyKeys.filter(key => coreFields.includes(key));

  try {
    const product = await runTransaction(async (client) => {
      let result;
      if (updateFieldsPresent.length > 0) {
        const setClauses: string[] = [];
        const updateParams: any[] = [];
        updateFieldsPresent.forEach((field, index) => {
          let val = req.body[field];
          if (field === 'b2bPrice' || field === 'offerPrice') {
            val = val !== '' && val !== undefined && val !== null ? Number(val) : null;
          } else if (field === 'sku') {
            val = val || null;
          } else if (field === 'basePrice' || field === 'stock') {
            val = Number(val);
          } else if (field === 'isActive') {
            val = val !== undefined ? (val === true || String(val).toLowerCase() === 'true') : true;
          }
          setClauses.push(`"${field}" = $${index + 1}`);
          updateParams.push(val);
        });

        // Always update updatedAt
        setClauses.push(`"updatedAt" = NOW()`);
        
        const idIndex = updateParams.length + 1;
        updateParams.push(id);

        const updateQuery = `
          UPDATE "Product" 
          SET ${setClauses.join(', ')} 
          WHERE id = $${idIndex} 
          RETURNING *
        `;

        console.log("[PUT /api/products/:id] Dynamic UPDATE params:", updateParams);
        try {
          result = await client.query(updateQuery, updateParams);
          console.log("[PUT /api/products/:id] UPDATE OK, rows returned:", result.rows.length);
        } catch (e: any) {
          console.error("[PUT /api/products/:id] UPDATE FAILED");
          console.error(e);
          console.error(e.stack);
          console.error("code:", e.code);
          console.error("detail:", e.detail);
          console.error("constraint:", e.constraint);
          throw e;
        }
      } else {
        result = await client.query(`SELECT * FROM "Product" WHERE id = $1`, [id]);
      }

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }

      // ── STEP 5: Update categories ──────────────────────────────────────
      const { categoryIds } = req.body;
      if (categoryIds !== undefined && Array.isArray(categoryIds)) {
        console.log("[PUT /api/products/:id] Updating categories:", categoryIds);
        try {
          await client.query(`DELETE FROM "ProductCategory" WHERE "productId" = $1`, [id]);
          for (const catId of categoryIds) {
            await client.query(`
              INSERT INTO "ProductCategory" ("productId", "categoryId")
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [id, catId]);
          }
          console.log("[PUT /api/products/:id] categories OK");
        } catch (e: any) {
          console.error("[PUT /api/products/:id] categories FAILED");
          console.error(e);
          console.error(e.stack);
          console.error("code:", e.code);
          console.error("detail:", e.detail);
          throw e;
        }
      }

      // ── STEP 6: Update image(s) ───────────────────────────────────────────
      const { imageUrl, images, pricingTiers } = req.body;
      if (images !== undefined && Array.isArray(images)) {
        console.log("[PUT /api/products/:id] Updating images array:", images.length);
        try {
          await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [id]);
          for (let i = 0; i < images.length; i++) {
            const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
            await client.query(`
              INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
              VALUES ($1, $2, $3, $4)
            `, [imageId, id, images[i], i === 0]);
          }
          console.log("[PUT /api/products/:id] images OK");
        } catch (e: any) {
          console.error("[PUT /api/products/:id] images FAILED");
          console.error(e);
          throw e;
        }
      } else if (imageUrl !== undefined) {
        console.log("[PUT /api/products/:id] Updating single image:", imageUrl);
        try {
          await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [id]);
          if (imageUrl) {
            const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
            await client.query(`
              INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
              VALUES ($1, $2, $3, true)
            `, [imageId, id, imageUrl]);
          }
          console.log("[PUT /api/products/:id] image OK");
        } catch (e: any) {
          console.error("[PUT /api/products/:id] image FAILED");
          console.error(e);
          throw e;
        }
      }

      // ── STEP 7: Update pricing tiers ───────────────────────────────────
      if (pricingTiers !== undefined && Array.isArray(pricingTiers)) {
        console.log("[PUT /api/products/:id] Updating pricing tiers:", pricingTiers.length);
        try {
          await client.query(`DELETE FROM "PricingTier" WHERE "productId" = $1`, [id]);
          for (const tier of pricingTiers) {
            const tierId = 'pt' + Math.random().toString(36).substring(2, 10);
            await client.query(`
              INSERT INTO "PricingTier" (id, "productId", "minQty", "maxQty", price)
              VALUES ($1, $2, $3, $4, $5)
            `, [tierId, id, tier.minQty, tier.maxQty || null, tier.price]);
          }
          console.log("[PUT /api/products/:id] pricing tiers OK");
        } catch (e: any) {
          console.error("[PUT /api/products/:id] pricing tiers FAILED");
          console.error(e);
          throw e;
        }
      }
      
      return result.rows[0];
    });

    console.log("[PUT /api/products/:id] SUCCESS, returning product id:", product?.id);
    res.json(product);
  } catch (error: any) {
    console.error("FATAL ERROR IN PUT /api/products/:id:", error);
    console.error("stack:", error.stack);
    console.error("code:", error.code);
    console.error("detail:", error.detail);
    console.error("constraint:", error.constraint);

    if (error.message === "Product not found") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({
      error: "Failed to update product",
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
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

async function sendOrderEmail(orderId: string) {
  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!fullOrder) {
      console.error(`[EMAIL ERROR] Order not found for ID: ${orderId}`);
      return;
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const hasConfig = !!(user && pass);

    let itemsHtml = "";
    let itemsText = "";

    fullOrder.items.forEach((item, index) => {
      const p = item.product;
      const weightStr = p.weight ? ` (${p.weight})` : "";
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5;">${index + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5;"><strong>${p.name}</strong>${weightStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `;
      itemsText += `${index + 1}. ${p.name}${weightStr} - Qty: ${item.quantity} - Price: ₹${item.price} - Total: ₹${item.price * item.quantity}\n`;
    });

    const clientName = fullOrder.user.name || "N/A";
    const clientEmail = fullOrder.user.email || "N/A";
    const clientPhone = fullOrder.user.phone || "N/A";
    const addressStr = fullOrder.address 
      ? `${fullOrder.address.address}, ${fullOrder.address.city}, ${fullOrder.address.state} - ${fullOrder.address.pinCode}`
      : "N/A";

    const emailSubject = `[Hasty Tasty Store] New B2C Order #${fullOrder.id} from ${clientName}`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #3A1E14; background-color: #FAF8F5; border: 1px solid #EBE3D5; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; border-bottom: 1px solid #EBE3D5; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #4A171E; font-size: 24px; margin: 0;">New Order Placed</h1>
          <p style="color: #C89F5F; font-size: 14px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Hasty Tasty Golaghat</p>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #666; width: 120px;">Name:</td>
              <td style="padding: 4px 0; font-weight: bold;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Email:</td>
              <td style="padding: 4px 0; font-weight: bold;"><a href="mailto:${clientEmail}" style="color: #C89F5F;">${clientEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Phone:</td>
              <td style="padding: 4px 0; font-weight: bold;">${clientPhone}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Shipping Address</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; font-weight: bold;">
            ${addressStr}
          </p>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px; overflow-x: auto;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #FAF8F5; text-align: left; font-weight: bold;">
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5;">#</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5;">Product</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5; text-align: center;">Qty</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5; text-align: right;">Price</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #666;">Total Amount:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right; font-size: 16px; color: #2E7D32;">₹${fullOrder.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Payment Method:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right;">Cash on Delivery (COD)</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; color: #888; font-size: 11px; margin-top: 30px; border-top: 1px solid #EBE3D5; padding-top: 16px;">
          <p style="margin: 0;">This is an automated email from Hasty Tasty Store.</p>
        </div>
      </div>
    `;

    const emailText = `
=== NEW B2C ORDER ===
Order ID: ${fullOrder.id}
Total Amount: ₹${fullOrder.totalAmount}
Payment: Cash on Delivery (COD)

CUSTOMER INFO:
Name: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone}

SHIPPING ADDRESS:
${addressStr}

ITEMS ORDERED:
${itemsText}
    `;

    if (hasConfig) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      console.log(`[EMAIL SENDING] Attempting to send order confirmation #${fullOrder.id} to hastytastyglt@gmail.com...`);
      await transporter.sendMail({
        from: `"${clientName} via Hasty Tasty" <${user}>`,
        to: "hastytastyglt@gmail.com",
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
      console.log(`[EMAIL SENT] Order confirmation #${fullOrder.id} successfully sent to hastytastyglt@gmail.com!`);
    } else {
      console.warn("[EMAIL CONFIG WARNING] SMTP_USER and SMTP_PASS are not configured. Logging order content to console instead:");
      console.log(emailText);
    }
  } catch (err) {
    console.error(`[EMAIL FATAL ERROR] Failed to send email for order ID ${orderId}:`, err);
  }
}

// ── ORDERS ──
app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const { userId, totalAmount, taxAmount, shippingAmount, notes, addressId, latitude, longitude, items } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    if (addressId && latitude !== undefined && longitude !== undefined) {
      // Update the customer's address with the precise location
      await withRetry(() => prisma.address.update({
        where: { id: addressId },
        data: { latitude, longitude }
      }));
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

    // Trigger order confirmation email in the background
    sendOrderEmail(order.id).catch(console.error);

    return res.status(201).json(order);
  } catch (error) {
    console.error("FATAL ERROR IN /api/orders:", error);
    return res.status(500).json({ error: "Failed to create order", details: String(error) });
  }
});

async function sendEnquiryEmail(enquiryId: string) {
  try {
    const fullEnquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: {
        user: {
          include: {
            businessProfile: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!fullEnquiry) {
      console.error(`[EMAIL ERROR] Enquiry not found for ID: ${enquiryId}`);
      return;
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const hasConfig = !!(user && pass);

    let itemsHtml = "";
    let itemsText = "";

    fullEnquiry.items.forEach((item, index) => {
      const p = item.product;
      const weightStr = p.weight ? ` (${p.weight})` : "";
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5;">${index + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5;"><strong>${p.name}</strong>${weightStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5;">${p.sku || "N/A"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #EBE3D5; text-align: center;">${item.quantity}</td>
        </tr>
      `;
      itemsText += `${index + 1}. ${p.name}${weightStr} (SKU: ${p.sku || "N/A"}) - Qty: ${item.quantity}\n`;
    });

    const isB2B = !!fullEnquiry.user.businessProfile;
    const clientName = fullEnquiry.user.name || "N/A";
    const clientEmail = fullEnquiry.user.email || "N/A";
    const clientPhone = fullEnquiry.user.phone || "N/A";
    const businessName = fullEnquiry.user.businessProfile?.businessName || "N/A";
    const gstNumber = fullEnquiry.user.businessProfile?.gstNumber || "N/A";

    const expectedDateStr = fullEnquiry.expectedDate
      ? new Date(fullEnquiry.expectedDate).toLocaleDateString("en-IN", { dateStyle: "long" })
      : "N/A";

    const notesStr = fullEnquiry.notes || "None";
    const emailSubject = `[Hasty Tasty B2B] New Enquiry #${fullEnquiry.id} from ${isB2B ? businessName : clientName}`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #3A1E14; background-color: #FAF8F5; border: 1px solid #EBE3D5; border-radius: 12px; padding: 24px;">
        <div style="text-align: center; border-bottom: 1px solid #EBE3D5; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #4A171E; font-size: 24px; margin: 0;">New B2B Enquiry</h1>
          <p style="color: #C89F5F; font-size: 14px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Hasty Tasty Golaghat</p>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #666; width: 120px;">Name:</td>
              <td style="padding: 4px 0; font-weight: bold;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Email:</td>
              <td style="padding: 4px 0; font-weight: bold;"><a href="mailto:${clientEmail}" style="color: #C89F5F;">${clientEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Phone:</td>
              <td style="padding: 4px 0; font-weight: bold;">${clientPhone}</td>
            </tr>
            ${isB2B ? `
            <tr>
              <td style="padding: 4px 0; color: #666;">Business:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #4A171E;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">GST Number:</td>
              <td style="padding: 4px 0; font-weight: bold;">${gstNumber}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Enquiry Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #666; width: 120px;">Enquiry ID:</td>
              <td style="padding: 4px 0; font-weight: bold;">${fullEnquiry.id}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Expected Date:</td>
              <td style="padding: 4px 0; font-weight: bold;">${expectedDateStr}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666; vertical-align: top;">Notes:</td>
              <td style="padding: 4px 0; font-style: italic;">${notesStr}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: white; border: 1px solid #EBE3D5; border-radius: 8px; padding: 16px; margin-bottom: 20px; overflow-x: auto;">
          <h3 style="margin-top: 0; color: #4A171E; border-bottom: 1px solid #FAF8F5; padding-bottom: 8px;">Requested Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #FAF8F5; text-align: left; font-weight: bold;">
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5;">#</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5;">Product</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5;">SKU</th>
                <th style="padding: 10px; border-bottom: 2px solid #EBE3D5; text-align: center;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; color: #888; font-size: 11px; margin-top: 30px; border-top: 1px solid #EBE3D5; padding-top: 16px;">
          <p style="margin: 0;">This is an automated email from Hasty Tasty B2B Portal.</p>
        </div>
      </div>
    `;

    const emailText = `
=== NEW B2B ENQUIRY ===
Enquiry ID: ${fullEnquiry.id}
Expected Date: ${expectedDateStr}
Notes: ${notesStr}

CUSTOMER INFO:
Name: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone}
${isB2B ? `Business: ${businessName}\nGST Number: ${gstNumber}\n` : ""}
ITEMS REQUESTED:
${itemsText}
    `;

    if (hasConfig) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      console.log(`[EMAIL SENDING] Attempting to send enquiry #${fullEnquiry.id} to hastytastyglt@gmail.com...`);
      await transporter.sendMail({
        from: `"${isB2B ? businessName : clientName} via Hasty Tasty" <${user}>`,
        to: "hastytastyglt@gmail.com",
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
      console.log(`[EMAIL SENT] Enquiry #${fullEnquiry.id} successfully sent to hastytastyglt@gmail.com!`);
    } else {
      console.warn("[EMAIL CONFIG WARNING] SMTP_USER and SMTP_PASS are not configured in environment variables. Logging mail content to console instead:");
      console.log(emailText);
    }
  } catch (err) {
    console.error(`[EMAIL FATAL ERROR] Failed to send email for enquiry ID ${enquiryId}:`, err);
  }
}

// ── ENQUIRIES ──
app.post("/api/enquiries", async (req: Request, res: Response) => {
  try {
    let { userId, notes, expectedDate, items } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (userId === "guest") {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) {
        userId = fallbackUser.id;
      } else {
        return res.status(400).json({ error: "No users exist in the database to link guest suggestion." });
      }
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
    
    // Trigger B2B notification email asynchronously
    sendEnquiryEmail(enquiry.id).catch(console.error);

    return res.status(201).json(enquiry);
  } catch (error) {
    console.error("FATAL ERROR IN /api/enquiries:", error);
    return res.status(500).json({ error: "Failed to submit enquiry", details: String(error) });
  }
});

// ── GET DASHBOARD STATS ──
app.get("/api/dashboard", async (req: Request, res: Response) => {
  try {
    const ordersRes = await queryWithRetry(`
      SELECT o.*, u.name as customer, u.email as "customerEmail"
      FROM "Order" o
      JOIN "User" u ON o."userId" = u.id
      ORDER BY o."createdAt" DESC
    `);

    const customersRes = await queryWithRetry(`
      SELECT * FROM "User" WHERE role IN ('CUSTOMER', 'B2B_CUSTOMER') ORDER BY "createdAt" DESC
    `);

    const productsRes = await queryWithRetry(`
      SELECT p.*,
             COALESCE((SELECT url FROM "ProductImage" WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1), '') as "imageUrl"
      FROM "Product" p
      ORDER BY p.stock ASC
    `);

    const topProductsRes = await queryWithRetry(`
      SELECT p.id, p.name, p.slug, p."basePrice" as price, 
             COALESCE((SELECT url FROM "ProductImage" WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1), '') as image,
             SUM(oi.quantity)::integer as "salesCount",
             SUM(oi.quantity * oi.price)::double precision as "totalRevenue"
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      GROUP BY p.id
      ORDER BY "salesCount" DESC
      LIMIT 5
    `);

    res.json({
      orders: ordersRes.rows,
      customers: customersRes.rows,
      products: productsRes.rows,
      topProducts: topProductsRes.rows
    });
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// ── GET DELIVERY BOY ORDERS ──
app.get("/api/delivery/orders", async (req: Request, res: Response) => {
  try {
    const deliveryBoyId = req.query.deliveryBoyId as string;
    if (!deliveryBoyId) {
      return res.status(400).json({ error: "deliveryBoyId is required" });
    }

    const orders = await withRetry(() => prisma.order.findMany({
      where: { 
        deliveryBoyId,
        status: {
          in: ["OUT_FOR_DELIVERY", "READY"] // Depending on how you want to filter
        }
      },
      include: {
        user: { select: { name: true, phone: true } },
        address: true,
        items: {
          include: { product: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    }));
    
    res.json(orders);
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/delivery/orders:", error);
    res.status(500).json({ error: "Failed to fetch delivery orders" });
  }
});

// ── GET ALL ORDERS (Admin) ──
app.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const result = await queryWithRetry(`
      SELECT o.*, 
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) as customer,
        (
          SELECT json_build_object(
            'id', a.id,
            'address', a.address,
            'city', a.city,
            'state', a.state,
            'pinCode', a."pinCode",
            'type', a.type
          )
          FROM "Address" a
          WHERE a.id = o."addressId"
        ) as address,
        (
          SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi."productId",
              'quantity', oi.quantity,
              'price', oi.price,
              'product', json_build_object(
                'name', p.name,
                'sku', p.sku,
                'weight', p.weight
              )
            )
          )
          FROM "OrderItem" oi
          JOIN "Product" p ON oi."productId" = p.id
          WHERE oi."orderId" = o.id
        ) as items
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
    const body = req.body as { status?: string, deliveryBoyId?: string };
    
    if (!body.status && body.deliveryBoyId === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const dataToUpdate: any = {};
    if (body.status) dataToUpdate.status = body.status;
    if (body.deliveryBoyId !== undefined) dataToUpdate.deliveryBoyId = body.deliveryBoyId === "" ? null : body.deliveryBoyId;

    const order = await withRetry(() => prisma.order.update({
      where: { id },
      data: dataToUpdate
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

// ── STAFF MANAGEMENT ──
app.get("/api/staff", async (req: Request, res: Response) => {
  try {
    const result = await queryWithRetry(`
      SELECT id, name, email, role, phone, "createdAt" 
      FROM "User" 
      WHERE role NOT IN ('CUSTOMER', 'B2B_CUSTOMER', 'PENDING_B2B')
      ORDER BY "createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("FATAL ERROR IN GET /api/staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

app.post("/api/staff", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true }
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error("FATAL ERROR IN POST /api/staff:", error);
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

app.put("/api/staff/:id/role", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const updatedUser = await withRetry(() => prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    }));
    
    res.json(updatedUser);
  } catch (error) {
    console.error(`FATAL ERROR IN PUT /api/staff/${req.params.id}/role:`, error);
    res.status(500).json({ error: "Failed to update staff role" });
  }
});

// ── GET CUSTOMERS ──
app.get("/api/customers", async (req: Request, res: Response) => {
  try {
    const result = await queryWithRetry(`
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

// ── RESET CUSTOMER PASSWORD ──
app.put("/api/customers/:id/reset-password", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    await runTransaction(async (client) => {
      // 1. Update the Supabase Auth password in auth.users using crypt (bcrypt)
      await client.query(`
        UPDATE auth.users 
        SET encrypted_password = crypt($1, gen_salt('bf')),
            updated_at = NOW()
        WHERE id = $2
      `, [newPassword, id]);

      // 2. Update the password in our public."User" table
      return await client.query(`
        UPDATE "User"
        SET password = $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING *
      `, [newPassword, id]);
    });

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("FATAL ERROR IN PUT /api/customers/:id/reset-password:", error);
    res.status(500).json({ error: "Failed to reset password", details: String(error) });
  }
});

// ── GET B2B APPLICATIONS ──
app.get("/api/b2b", async (req: Request, res: Response) => {
  try {
    const result = await queryWithRetry(`
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
    const result = await queryWithRetry(`
      SELECT e.*, 
        json_build_object('name', u.name, 'email', u.email, 'phone', u.phone) as customer,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ei.id,
                'quantity', ei.quantity,
                'product', json_build_object('name', p.name, 'sku', p.sku, 'price', p."basePrice")
              )
            )
            FROM "EnquiryItem" ei
            JOIN "Product" p ON ei."productId" = p.id
            WHERE ei."enquiryId" = e.id
          ),
          '[]'::json
        ) as items
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
    
    const userRes = await queryWithRetry(
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
