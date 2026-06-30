const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function findDependencies() {
  try {
    // Query to find all tables that have a foreign key pointing to the "Product" table
    const query = `
      SELECT
        tc.table_name AS foreign_table,
        kcu.column_name AS foreign_column,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column,
        rc.delete_rule AS on_delete_rule
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON rc.unique_constraint_name = ccu.constraint_name
          AND rc.unique_constraint_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'Product';
    `;
    
    const res = await pool.query(query);
    console.log("Foreign Key Constraints referencing 'Product':");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

findDependencies();
