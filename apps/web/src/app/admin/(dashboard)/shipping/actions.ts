"use server";

import { prisma } from "database";

export async function saveShippingRates(ratesMap: Record<string, number>) {
  try {
    const states = Object.keys(ratesMap);
    
    // We can run an array of upserts within a transaction
    const upserts = states.map((state) => {
      const rate = ratesMap[state];
      return prisma.shippingRate.upsert({
        where: { state },
        update: { rate },
        create: { state, rate }
      });
    });

    await prisma.$transaction(upserts);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save shipping rates via Prisma:", error);
    return { success: false, error: error.message };
  }
}

export async function getShippingRates() {
  try {
    const rates = await prisma.shippingRate.findMany();
    return { data: rates, error: null };
  } catch (error: any) {
    console.error("Failed to fetch shipping rates via Prisma:", error);
    return { data: null, error: error.message };
  }
}
