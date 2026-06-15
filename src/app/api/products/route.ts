import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const published = searchParams.get("published");

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(published !== null ? { published: published === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = body.slug || slugify(body.name);

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || "",
        price: body.price,
        comparePrice: body.comparePrice || null,
        category: body.category,
        sizes: JSON.stringify(body.sizes || []),
        colors: JSON.stringify(body.colors || []),
        images: JSON.stringify(body.images || []),
        inventory: typeof body.inventory === "string" ? body.inventory : JSON.stringify(body.inventory || {}),
        primaryColor: body.primaryColor || null,
        stock: body.stock || 0,
        published: body.published || false,
        featured: body.featured || false,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Slug already exists or invalid data" }, { status: 400 });
  }
}
