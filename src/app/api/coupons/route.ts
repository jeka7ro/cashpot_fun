import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    const coupon = await prisma.couponCode.create({
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        minOrder: body.minOrder,
        maxUses: body.maxUses,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Codul există deja" }, { status: 400 });
  }
}
