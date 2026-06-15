import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { position: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, description } = await req.json();
  try {
    const cat = await prisma.category.create({ data: { name, slug: slug.toLowerCase(), description } });
    return NextResponse.json(cat, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug deja există" }, { status: 400 });
  }
}
