import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ error: "Cod lipsă" }, { status: 400 });

  const coupon = await prisma.couponCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Cod invalid sau expirat" }, { status: 400 });
  }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return NextResponse.json({ error: "Codul a expirat" }, { status: 400 });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Codul a atins limita de utilizări" }, { status: 400 });
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return NextResponse.json({
      error: `Comanda minimă pentru acest cod este ${coupon.minOrder} RON`,
    }, { status: 400 });
  }

  const discount = coupon.type === "percent"
    ? (subtotal * coupon.value) / 100
    : Math.min(coupon.value, subtotal);

  return NextResponse.json({ discount: Math.round(discount * 100) / 100, coupon });
}
