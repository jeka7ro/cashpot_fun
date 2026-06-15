import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current, next } = await req.json();
  const admin = await prisma.admin.findUnique({ where: { email: session.user?.email! } });
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const valid = await bcrypt.compare(current, admin.password);
  if (!valid) return NextResponse.json({ error: "Parola curentă incorectă" }, { status: 400 });

  const hashed = await bcrypt.hash(next, 12);
  await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } });
  return NextResponse.json({ ok: true });
}
