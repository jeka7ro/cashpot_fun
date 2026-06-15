import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, address, city, postalCode, notes, items, subtotal, shipping, discount, total, couponCode } = body;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      email,
      name,
      phone,
      address,
      city,
      postalCode,
      notes,
      subtotal,
      shipping,
      discount: discount || 0,
      total,
      couponCode: couponCode || null,
      items: {
        create: items.map((item: {
          productId: string; name: string; price: number;
          quantity: number; size?: string; color?: string;
        }) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
      },
    },
  });

  // Increment coupon usage
  if (couponCode) {
    await prisma.couponCode.updateMany({
      where: { code: couponCode.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Stripe checkout
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("your_stripe")) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [
          ...items.map((item: { name: string; price: number; quantity: number }) => ({
            price_data: {
              currency: "ron",
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          {
            price_data: {
              currency: "ron",
              product_data: { name: "Livrare" },
              unit_amount: Math.round(shipping * 100),
            },
            quantity: 1,
          },
          ...(discount > 0 ? [{
            price_data: {
              currency: "ron",
              product_data: { name: `Reducere (${couponCode})` },
              unit_amount: -Math.round(discount * 100),
            },
            quantity: 1,
          }] : []),
        ],
        metadata: { orderId: order.id, orderNumber },
        success_url: `${process.env.NEXTAUTH_URL}/checkout/success?order=${orderNumber}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
      });

      await prisma.order.update({ where: { id: order.id }, data: { stripeId: session.id } });
      return NextResponse.json({ orderNumber, stripeUrl: session.url });
    } catch {
      // Fall through
    }
  }

  return NextResponse.json({ orderNumber });
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
