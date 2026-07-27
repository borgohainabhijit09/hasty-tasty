require('dotenv').config({ path: './packages/database/.env' });
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!dbUrl) {
  console.error("Missing DB URL");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function migrate() {
  try {
    console.log("Running migration to add sku, stock, isActive to Product table...");
    await pool.query(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS sku TEXT,
      ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
    `);
    
    // Add unique constraint separately if it doesn't exist
    try {
      await pool.query(`ALTER TABLE "Product" ADD CONSTRAINT "Product_sku_key" UNIQUE (sku);`);
      console.log("Added unique constraint on SKU.");
    } catch (e) {
      if (e.code === '42P07') {
         console.log("Unique constraint on SKU already exists.");
      } else {
         console.log("SKU constraint error:", e.message);
      }
    }

    // Populate fake SKUs for existing products
    console.log("Populating SKUs for existing products...");
    const { rows } = await pool.query(`SELECT id, name FROM "Product" WHERE sku IS NULL`);
    for (const row of rows) {
      // Create a random SKU based on name
      const prefix = row.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
      const random = Math.floor(Math.random() * 900) + 100;
      const sku = `${prefix}${random}`;
      await pool.query(`UPDATE "Product" SET sku = $1, stock = 10 WHERE id = $2`, [sku, row.id]);
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await pool.end();
  }
}

migrate();
