import { NextRequest, NextResponse } from "next/server";
import { prisma } from "database";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const datePreset = searchParams.get("datePreset") || "ALL";
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const where: any = {};

    // 1. Status Filter
    if (status !== "ALL") {
      where.status = status;
    }

    // 2. Date Filter
    let start: Date | null = null;
    let end: Date | null = null;

    if (datePreset !== "ALL") {
      const now = new Date();
      if (datePreset === "TODAY") {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (datePreset === "YESTERDAY") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        start = new Date(yesterday.setHours(0, 0, 0, 0));
        end = new Date(yesterday.setHours(23, 59, 59, 999));
      } else if (datePreset === "LAST_7_DAYS") {
        start = new Date();
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date();
      } else if (datePreset === "LAST_30_DAYS") {
        start = new Date();
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end = new Date();
      } else if (datePreset === "THIS_MONTH") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
      } else if (datePreset === "LAST_MONTH") {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else if (datePreset === "CUSTOM" && startDateStr && endDateStr) {
        start = new Date(startDateStr);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
      }
    } else if (startDateStr && endDateStr) {
      start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
    }

    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = start;
      if (end) where.createdAt.lte = end;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const flattenedOrders = orders.map((o) => {
      // Create a summary of items
      const itemsSummary = o.items.map(item => `${item.quantity}x ${item.product?.name || 'Unknown'}`).join(" | ");

      return {
        orderId: o.id,
        status: o.status,
        customerName: o.user?.name || "Unknown",
        customerEmail: o.user?.email || "Unknown",
        customerPhone: o.user?.phone || "",
        totalAmount: o.totalAmount,
        taxAmount: o.taxAmount,
        shippingAmount: o.shippingAmount,
        itemsSummary: itemsSummary,
        shippingAddress: o.address 
          ? `${o.address.address}, ${o.address.city}, ${o.address.state} - ${o.address.pinCode}`
          : "",
        notes: o.notes || "",
        createdAt: o.createdAt.toISOString()
      };
    });

    const csv = Papa.unparse(flattenedOrders);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders_export_${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Failed to export orders:", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
