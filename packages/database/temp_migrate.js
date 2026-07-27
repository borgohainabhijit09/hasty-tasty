const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres' });

async function run() {
  try {
    await pool.query('ALTER TYPE "Role" ADD VALUE \'PENDING_B2B\'');
    console.log('Role added');
  } catch(e) {
    console.error('Role add error:', e.message);
  }
  
  try {
    await pool.query('ALTER TABLE "BusinessProfile" ADD COLUMN "tradeLicense" text');
    console.log('Column added');
  } catch(e) {
    console.error('Column add error:', e.message);
  }
}

run().finally(() => pool.end());
