import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import B2BRequestsClient from './B2BRequestsClient';

export default async function B2BRequestsPage() {
  const supabase = await createClient();

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: adminUser } = await supabase.from('User').select('role').eq('id', user.id).single();
  if (adminUser?.role !== 'SUPER_ADMIN') redirect('/');

  // Fetch all pending requests with user details
  const { data: requests, error } = await supabase
    .from('BusinessProfile')
    .select(`
      id,
      userId,
      businessName,
      gstNumber,
      contactPerson,
      tradeLicense,
      status,
      user:userId (
        email,
        phone,
        name,
        createdAt
      )
    `)
    .eq('status', 'PENDING')
    .order('userId', { ascending: false }); // Supabase doesn't easily let us order by nested relations' fields directly unless we do inner joins or view, but let's just fetch them.

  if (error) {
    console.error("Error fetching requests:", error);
  }

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
