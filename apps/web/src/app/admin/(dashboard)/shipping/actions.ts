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
