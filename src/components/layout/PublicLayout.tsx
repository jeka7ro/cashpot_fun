"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: any;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar brandName={settings["site.name"] || "CASHPOT"} hasAnnouncement={false} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
