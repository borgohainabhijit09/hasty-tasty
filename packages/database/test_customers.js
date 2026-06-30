const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    const res = await pool.query(`
      SELECT id, name, email, role, phone, "createdAt" 
      FROM "User" 
      WHERE role IN ('CUSTOMER', 'B2B_CUSTOMER')
      ORDER BY "createdAt" DESC
    `);
    console.log("SUCCESS:", res.rows);
  } catch (err) {
    console.error("DATABASE ERROR:", err);
  } finally {
    await pool.end();
  }
}
test();
