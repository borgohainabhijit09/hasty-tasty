const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkActivity() {
  try {
    console.log("=== Active Connections and States ===");
    const activity = await pool.query(`
      SELECT pid, state, query, query_start, state_change
      FROM pg_stat_activity
      WHERE pid != pg_backend_pid() AND datname = 'postgres';
    `);
    console.table(activity.rows);

    console.log("\n=== Terminating all other idle/active transactions to release locks ===");
    // Terminate all backends that are not the current backend
    const terminate = await pool.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE pid != pg_backend_pid() AND datname = 'postgres';
    `);
    console.log(`Terminated ${terminate.rowCount} backends.`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkActivity();
