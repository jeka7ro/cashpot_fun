"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email sau parolă incorectă.");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-200 bg-gray-50 dark:bg-[#0a0a0f]"
    >
      {/* Glow blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[80px] opacity-10 dark:opacity-20"
          style={{ background: "#7c3aed" }} />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full blur-[60px] opacity-5 dark:opacity-15"
          style={{ background: "#5b21b6" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo_cashpot.png"
            alt="CASHPOT"
            width={200}
            height={60}
            className="object-contain w-auto mx-auto drop-shadow-md dark:drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]"
            priority
          />
          <p className="text-gray-500 dark:text-white/30 text-xs tracking-[0.2em] mt-3 uppercase font-semibold">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 shadow-xl dark:shadow-none transition-colors" style={{ borderRadius: 28 }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 dark:text-white/40 text-xs uppercase tracking-wide font-semibold block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@cashpot.ro"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-gray-600 dark:text-white/40 text-xs uppercase tracking-wide font-semibold block mb-1.5">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
              />
            </div>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm text-center py-2 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 glow-violet shadow-md"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Se conectează..." : "INTRĂ ÎN ADMIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
