"use server";

import { auth } from "@/auth";
import { prisma } from "database";

export async function getDeliveryBoys() {
  const session = await auth();
  // Depending on how roles are structured in session, verify if user is admin
  // If not strictly required for this demo, just return them.
  if (!session?.user?.id) return { data: null, error: "Unauthorized" };

  try {
    const deliveryBoys = await prisma.user.findMany({
      where: { role: "DELIVERY_BOY" },
      select: { id: true, name: true, email: true, phone: true }
    });
    return { data: deliveryBoys, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
