const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function terminateMyConnections() {
  try {
    console.log("Finding connections owned by 'postgres'...");
    const res = await pool.query(`
      SELECT pid, usename, state, query 
      FROM pg_stat_activity 
      WHERE usename = 'postgres' AND pid != pg_backend_pid();
    `);
    console.table(res.rows);

    for (const row of res.rows) {
      console.log(`Terminating connection pid ${row.pid}...`);
      const termRes = await pool.query('SELECT pg_terminate_backend($1)', [row.pid]);
      console.log(`Result for pid ${row.pid}:`, termRes.rows[0].pg_terminate_backend);
    }
    console.log("Done.");
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

terminateMyConnections();
