"use server";

import { auth } from "@/auth";
import { prisma } from "database";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
  const session = await auth();
  if (!session?.user?.id) return { data: null, error: "Unauthorized" };

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { type: 'asc' }
    });
    return { data: addresses, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function createAddress(data: { type: any, address: string, city: string, state: string, pinCode: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.address.create({
      data: {
        userId: session.user.id,
        ...data
      }
    });
    revalidatePath("/account/addresses");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateAddress(id: string, data: { type: any, address: string, city: string, state: string, pinCode: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.address.update({
      where: { id, userId: session.user.id },
      data
    });
    revalidatePath("/account/addresses");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.address.delete({
      where: { id, userId: session.user.id }
    });
    revalidatePath("/account/addresses");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getOrderHistory() {
  const session = await auth();
  if (!session?.user?.id) return { data: null, error: "Unauthorized" };

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        address: {
          select: { address: true, city: true, state: true, pinCode: true, type: true }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: { select: { url: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: orders, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function getAccountDetails() {
  const session = await auth();
  if (!session?.user?.id) return { data: null, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    return { data: user, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function updateAccountDetails(data: { name: string, phone: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data
    });
    revalidatePath("/account");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
