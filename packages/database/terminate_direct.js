const { Pool } = require('pg');

const pool = new Pool({
  // Connecting to port 5432 directly (non-pooler)
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function terminate() {
  try {
    console.log("Attempting to terminate pid 866808 via direct connection...");
    const res = await pool.query("SELECT pg_terminate_backend(866808)");
    console.log("RESULT:", res.rows);
  } catch (err) {
    console.error("TERMINATE FAILED:", err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

terminate();
