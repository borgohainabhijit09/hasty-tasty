import { NextResponse } from "next/server";
import { prisma } from "database";
import Papa from "papaparse";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productCategories: {
          include: { category: true }
        }
      }
    });

    const flattenedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || "",
      description: p.description,
      basePrice: p.basePrice,
      b2bPrice: p.b2bPrice || "",
      stock: p.stock,
      isActive: p.isActive,
      categories: p.productCategories.map(pc => pc.category.name).join(", "),
      ingredients: p.ingredients || "",
      shelfLife: p.shelfLife || "",
      weight: p.weight || "",
      createdAt: p.createdAt.toISOString()
    }));

    const csv = Papa.unparse(flattenedProducts);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products_export_${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Failed to export products:", error);
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}
