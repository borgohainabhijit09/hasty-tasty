"use server";

import { auth } from "@/auth";
import { revalidatePath } from 'next/cache';
import { prisma } from 'database';

export async function approveB2BRequest(businessProfileId: string, userId: string) {
  const session = await auth();

  // Verify Admin
  const user = session?.user;
  if (!user?.email) return { error: "Unauthorized" };

  const adminUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  
  if (adminUser?.role !== 'SUPER_ADMIN') return { error: "Unauthorized" };

  try {
    // Update BusinessProfile
    await prisma.businessProfile.update({
      where: { id: businessProfileId },
      data: { status: 'APPROVED' }
    });

    // Update User role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'B2B_CUSTOMER' }
    });

    revalidatePath('/admin/b2b-requests');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function rejectB2BRequest(businessProfileId: string) {
  const session = await auth();

  // Verify Admin
  const user = session?.user;
  if (!user?.email) return { error: "Unauthorized" };

  const adminUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  
  if (adminUser?.role !== 'SUPER_ADMIN') return { error: "Unauthorized" };

  try {
    // Update BusinessProfile
    await prisma.businessProfile.update({
      where: { id: businessProfileId },
      data: { status: 'REJECTED' }
    });

    revalidatePath('/admin/b2b-requests');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
