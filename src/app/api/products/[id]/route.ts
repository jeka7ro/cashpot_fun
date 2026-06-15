import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.comparePrice !== undefined && { comparePrice: body.comparePrice }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.sizes !== undefined && { sizes: JSON.stringify(body.sizes) }),
        ...(body.colors !== undefined && { colors: JSON.stringify(body.colors) }),
        ...(body.images !== undefined && { images: JSON.stringify(body.images) }),
        ...(body.inventory !== undefined && { inventory: typeof body.inventory === "string" ? body.inventory : JSON.stringify(body.inventory) }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.published !== undefined && { published: body.published }),
        ...(body.featured !== undefined && { featured: body.featured }),
      },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Eroare la actualizare (posibil trebuie restartat serverul de dev): " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
