const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function getCategories() {
  try {
    const res = await pool.query('SELECT id, name, slug FROM "Category"');
    console.log("Existing Categories:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

getCategories();
