import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Număr", "Data", "Status", "Nume", "Email", "Telefon", "Adresă", "Oraș", "Cod poștal", "Produse", "Subtotal", "Livrare", "Discount", "Total", "AWB"],
    ...orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString("ro-RO"),
      o.status,
      o.name,
      o.email,
      o.phone || "",
      o.address,
      o.city,
      o.postalCode,
      o.items.map((i) => `${i.name}(${i.quantity})`).join("; "),
      o.subtotal.toFixed(2),
      o.shipping.toFixed(2),
      o.discount.toFixed(2),
      o.total.toFixed(2),
      o.trackingNumber || "",
    ]),
  ];

  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="comenzi-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
