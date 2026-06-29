require('dotenv').config({ path: './apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log("Signing up admin user...");
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@hastytasty.com',
    password: 'admin123',
    options: {
      data: {
        name: 'Abhijit Borgohain',
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log("Admin user already registered in auth.");
      // We still need to update the role in the public.User table.
    } else {
      console.error("Error signing up:", error);
      return;
    }
  } else {
    console.log("Admin user created in auth.users.");
  }

  // The signup action automatically inserts into public.User if done via frontend, 
  // but since we are doing it via script, we might need to insert it manually.
  // Wait, our backend doesn't have a trigger. The frontend action has the logic.
  // So we'll use the pg pool to insert/update the public.User table directly.
  
  require('dotenv').config({ path: './packages/database/.env' });
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!dbUrl) {
    console.error("Missing DB URL");
    return;
  }
  
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    const userId = data?.user?.id;
    if (userId) {
       console.log("Inserting into public.User...");
       await pool.query(`
         INSERT INTO "User" (id, email, password, name, role, "updatedAt")
         VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', NOW())
         ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN';
       `, [userId, 'admin@hastytasty.com', 'admin123', 'Abhijit Borgohain']);
    } else {
       // If already exists, just update role
       console.log("Updating role for admin@hastytasty.com to SUPER_ADMIN...");
       await pool.query(`
         UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'admin@hastytasty.com';
       `);
    }
    console.log("Admin setup complete!");
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await pool.end();
  }
}

createAdmin();
