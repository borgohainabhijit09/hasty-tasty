import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import B2BRequestsClient from './B2BRequestsClient';
import { prisma } from 'database';

export default async function B2BRequestsPage() {
  const session = await auth();

  // Verify Admin
  const user = session?.user;
  if (!user?.email) redirect('/admin/login');

  const adminUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  
  if (adminUser?.role !== 'SUPER_ADMIN') redirect('/');

  // Fetch all pending requests with user details
  const requests = await prisma.businessProfile.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          email: true,
          phone: true,
          name: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      userId: 'desc'
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">B2B Wholesaler Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage pending wholesale accounts.</p>
      </div>

      <B2BRequestsClient initialRequests={requests || []} />
    </div>
  );
}
