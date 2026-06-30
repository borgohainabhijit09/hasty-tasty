const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    const ordersRes = await pool.query('SELECT COUNT(*) FROM "Order"');
    const usersRes = await pool.query('SELECT COUNT(*) FROM "User"');
    const productsRes = await pool.query('SELECT COUNT(*) FROM "Product"');
    console.log("Order Count:", ordersRes.rows[0].count);
    console.log("User Count:", usersRes.rows[0].count);
    console.log("Product Count:", productsRes.rows[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
test();
