"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveB2BRequest(businessProfileId: string, userId: string) {
  const supabase = await createClient();

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: adminUser } = await supabase.from('User').select('role').eq('id', user.id).single();
  if (adminUser?.role !== 'SUPER_ADMIN') return { error: "Unauthorized" };

  // Update BusinessProfile
  const { error: profileError } = await supabase
    .from('BusinessProfile')
    .update({ status: 'APPROVED' })
    .eq('id', businessProfileId);

  if (profileError) return { error: profileError.message };

  // Update User role
  const { error: userError } = await supabase
    .from('User')
    .update({ role: 'B2B_CUSTOMER' })
    .eq('id', userId);

  if (userError) return { error: userError.message };

  revalidatePath('/admin/b2b-requests');
  return { success: true };
}

export async function rejectB2BRequest(businessProfileId: string) {
  const supabase = await createClient();

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: adminUser } = await supabase.from('User').select('role').eq('id', user.id).single();
  if (adminUser?.role !== 'SUPER_ADMIN') return { error: "Unauthorized" };

  // Update BusinessProfile
  const { error: profileError } = await supabase
    .from('BusinessProfile')
    .update({ status: 'REJECTED' })
    .eq('id', businessProfileId);

  if (profileError) return { error: profileError.message };

  revalidatePath('/admin/b2b-requests');
  return { success: true };
}
