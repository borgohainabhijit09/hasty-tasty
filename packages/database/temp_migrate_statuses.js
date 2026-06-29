const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres' });

async function run() {
  try {
    await pool.query('ALTER TYPE "OrderStatus" ADD VALUE \'ACCEPTED\'');
    console.log('OrderStatus ACCEPTED added');
  } catch(e) {
    console.error('OrderStatus ACCEPTED add error:', e.message);
  }

  try {
    await pool.query('ALTER TYPE "OrderStatus" ADD VALUE \'PROCESSING\'');
    console.log('OrderStatus PROCESSING added');
  } catch(e) {
    console.error('OrderStatus PROCESSING add error:', e.message);
  }

  try {
    await pool.query('ALTER TYPE "EnquiryStatus" ADD VALUE \'ACCEPTED\'');
    console.log('EnquiryStatus ACCEPTED added');
  } catch(e) {
    console.error('EnquiryStatus ACCEPTED add error:', e.message);
  }
  
  try {
    await pool.query('ALTER TYPE "EnquiryStatus" ADD VALUE \'PROCESSING\'');
    console.log('EnquiryStatus PROCESSING added');
  } catch(e) {
    console.error('EnquiryStatus PROCESSING add error:', e.message);
  }

  try {
    await pool.query('ALTER TYPE "EnquiryStatus" ADD VALUE \'OUT_FOR_DELIVERY\'');
    console.log('EnquiryStatus OUT_FOR_DELIVERY added');
  } catch(e) {
    console.error('EnquiryStatus OUT_FOR_DELIVERY add error:', e.message);
  }

  try {
    await pool.query('ALTER TYPE "EnquiryStatus" ADD VALUE \'DELIVERED\'');
    console.log('EnquiryStatus DELIVERED added');
  } catch(e) {
    console.error('EnquiryStatus DELIVERED add error:', e.message);
  }
}

run().finally(() => pool.end());
