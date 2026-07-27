const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDelete() {
  const id = 'pyeuqqdw11s19hfn9'; // Dummy 1
  try {
    await pool.query('BEGIN');
    
    // We will simulate what the API does for single delete:
    await pool.query(`DELETE FROM "ProductCategory" WHERE "productId" = $1`, [id]);
    await pool.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [id]);
    await pool.query(`DELETE FROM "PricingTier" WHERE "productId" = $1`, [id]);
    await pool.query(`DELETE FROM "Review" WHERE "productId" = $1`, [id]);
    
    // Attempt delete
    const res = await pool.query(`DELETE FROM "Product" WHERE id = $1 RETURNING *`, [id]);
    console.log("Deleted successfully:", res.rows);
    
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("DELETE FAILED WITH ERROR:", err.message);
    console.error("FULL ERROR:", err);
  } finally {
    await pool.end();
  }
}

testDelete();
