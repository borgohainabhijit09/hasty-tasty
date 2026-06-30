const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyCascadeDelete() {
  try {
    console.log("Applying SQL migration for ON DELETE CASCADE...");
    
    await pool.query('BEGIN');
    
    // 1. Drop existing constraints
    console.log("Dropping old foreign key constraints...");
    await pool.query('ALTER TABLE "ProductImage" DROP CONSTRAINT IF EXISTS "ProductImage_productId_fkey"');
    await pool.query('ALTER TABLE "PricingTier" DROP CONSTRAINT IF EXISTS "PricingTier_productId_fkey"');
    await pool.query('ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_productId_fkey"');
    await pool.query('ALTER TABLE "Wishlist" DROP CONSTRAINT IF EXISTS "Wishlist_productId_fkey"');
    
    // 2. Re-add constraints with ON DELETE CASCADE
    console.log("Adding new foreign key constraints with ON DELETE CASCADE...");
    await pool.query('ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE');
    await pool.query('ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE');
    await pool.query('ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE');
    await pool.query('ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE');
    
    await pool.query('COMMIT');
    console.log("SQL Migration applied successfully!");
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("SQL MIGRATION FAILED:", err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

applyCascadeDelete();
