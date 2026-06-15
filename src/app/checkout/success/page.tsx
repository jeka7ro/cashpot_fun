import Link from "next/link";
import { CheckCircle } from "lucide-react";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle className="mx-auto mb-6 text-violet-500" size={64} />
      <h1 className="text-4xl font-black tracking-tight mb-3">COMANDĂ PLASATĂ!</h1>
      {order && (
        <p className="text-white/40 text-sm mb-2">
          Număr comandă: <span className="text-white font-mono">{order}</span>
        </p>
      )}
      <p className="text-white/60 mb-8 leading-relaxed">
        Mulțumim pentru comandă! Vei primi un email de confirmare în curând.
        Livrare estimată: 2-5 zile lucrătoare.
      </p>
      <Link
        href="/shop"
        className="inline-block bg-violet-500 hover:bg-violet-400 text-black font-bold px-8 py-4 rounded-xl text-sm tracking-wide transition"
      >
        CONTINUĂ CUMPĂRĂTURILE
      </Link>
    </div>
  );
}
