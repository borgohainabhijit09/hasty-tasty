require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Starting migration...');
  try {
    const result = await pool.query(`
      INSERT INTO "ProductCategory" ("productId", "categoryId")
      SELECT id, "categoryId" FROM "Product"
      WHERE "categoryId" IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
    console.log(`Migration complete. Inserted ${result.rowCount} rows.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
