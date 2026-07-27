import AdminLayoutClient from './AdminLayoutClient';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from 'database';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/admin/login');
  }

  const userDb = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (userDb?.role === 'DELIVERY_BOY') {
    redirect('/delivery');
  }

  if (!userDb || !['SUPER_ADMIN', 'MANAGER'].includes(userDb.role)) {
    redirect('/admin/login');
  }

  const initials = userDb.name 
    ? userDb.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'A';

  return (
    <AdminLayoutClient initials={initials} userName={userDb.name} role={userDb.role}>
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
