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
        user: {
          include: {
            businessProfile: true
          }
        },
        address: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const tallyRows: any[] = [];

    orders.forEach((o) => {
      // Determine the party ledger name
      const partyName = o.user?.businessProfile?.businessName || o.user?.name || "Cash Sales";
      const customerGst = o.user?.businessProfile?.gstNumber || "";
      const paymentMode = o.notes || "COD";
      const invoiceNo = `HT-${o.id.slice(0, 8).toUpperCase()}`;
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-'); // Format: DD-MM-YYYY

      o.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        
        // For bakery, 5% GST is standard
        // We split it 50/50 into CGST (2.5%) and SGST (2.5%)
        // If tax is included (which is standard for storefront checkout pricing):
        // Taxable Value = itemTotal / 1.05
        // CGST = (itemTotal - Taxable Value) / 2
        // SGST = (itemTotal - Taxable Value) / 2
        const gstRate = 5; // 5%
        const taxableValue = itemTotal / 1.05;
        const totalTax = itemTotal - taxableValue;
        const cgst = totalTax / 2;
        const sgst = totalTax / 2;

        tallyRows.push({
          "Invoice Date": dateStr,
          "Invoice No": invoiceNo,
          "Voucher Type": "Sales",
          "Party Ledger Name": partyName,
          "Customer GSTIN": customerGst,
          "Stock Item Name": item.product?.name || "Unknown Item",
          "Product SKU": item.product?.sku || "",
          "HSN Code": "1905", // Bakery Products HSN code
          "Quantity": item.quantity,
          "Rate": item.price.toFixed(2),
          "Total Item Value": itemTotal.toFixed(2),
          "Taxable Subtotal": taxableValue.toFixed(2),
          "GST Rate (%)": gstRate,
          "CGST Amount": cgst.toFixed(2),
          "SGST Amount": sgst.toFixed(2),
          "IGST Amount": "0.00",
          "Delivery Charge": index === 0 ? (o.shippingAmount || 0).toFixed(2) : "0.00",
          "Order Grand Total": o.totalAmount.toFixed(2),
          "Payment Mode": paymentMode,
          "Payment Reference": o.notes || ""
        });
      });
    });

    const csv = Papa.unparse(tallyRows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tally_orders_export_${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error: any) {
    console.error("Failed to export tally orders:", error);
    return NextResponse.json({ 
      error: "Failed to export Tally orders", 
      message: error?.message || String(error)
    }, { status: 500 });
  }
}
