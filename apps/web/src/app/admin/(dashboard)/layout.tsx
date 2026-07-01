import AdminLayoutClient from './AdminLayoutClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.email) {
    redirect('/admin/login');
  }

  // Fetch role from internal API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
  const res = await fetch(`${apiUrl}/api/users/me?email=${encodeURIComponent(user.email)}`);
  
  if (!res.ok) {
    redirect('/admin/login');
  }
  
  const userDb = await res.json();
  
  if (userDb.role !== 'SUPER_ADMIN') {
    redirect('/'); // Kick back to storefront
  }

  const initials = userDb.name 
    ? userDb.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'A';

  return (
    <AdminLayoutClient initials={initials} userName={userDb.name}>
      {children}
      
      {/* Global styles for custom scrollbar for this specific layout if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        aside .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}} />
    </AdminLayoutClient>
  );
}
