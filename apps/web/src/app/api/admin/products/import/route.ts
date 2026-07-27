import { NextRequest, NextResponse } from "next/server";
import { prisma } from "database";
import Papa from "papaparse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    
    if (parsed.errors.length > 0) {
      console.warn("CSV parsing warnings/errors:", parsed.errors);
    }

    const rows = parsed.data as any[];
    let successCount = 0;
    let errorCount = 0;

    // Process rows sequentially to avoid unique constraint race conditions
    for (const row of rows) {
      try {
        const name = row.name?.trim();
        const basePrice = parseFloat(row.basePrice);
        
        if (!name || isNaN(basePrice)) {
          console.error(`Invalid row: name or basePrice missing. Row: ${JSON.stringify(row)}`);
          errorCount++;
          continue;
        }

        const sku = row.sku?.trim() || null;
        let slug = row.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        const description = row.description?.trim() || "No description provided.";
        const b2bPrice = row.b2bPrice ? parseFloat(row.b2bPrice) : null;
        const stock = row.stock ? parseInt(row.stock) : 0;
        const isActive = row.isActive ? String(row.isActive).toLowerCase() === 'true' : true;

        const data = {
          name,
          slug,
          sku,
          description,
          basePrice,
          b2bPrice: isNaN(b2bPrice as number) ? null : b2bPrice,
          stock: isNaN(stock) ? 0 : stock,
          isActive,
          ingredients: row.ingredients || null,
          shelfLife: row.shelfLife || null,
          weight: row.weight || null,
        };

        // Try to find existing product by SKU first, then by Slug
        let existing = null;
        if (sku) {
          existing = await prisma.product.findUnique({ where: { sku } });
        }
        if (!existing) {
          existing = await prisma.product.findUnique({ where: { slug } });
        }

        if (existing) {
          // If the slug changed but conflicts with another, prisma will throw, which is caught below
          await prisma.product.update({
            where: { id: existing.id },
            data
          });
        } else {
          await prisma.product.create({
            data
          });
        }
        successCount++;
      } catch (err) {
        console.error(`Failed to process row: ${JSON.stringify(row)}`, err);
        errorCount++;
      }
    }

    return NextResponse.json({ 
      message: `Import completed. Success: ${successCount}, Errors: ${errorCount}`
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to import products:", error);
    return NextResponse.json({ error: "Internal server error during import" }, { status: 500 });
  }
}
