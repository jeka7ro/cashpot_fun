import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SessionProvider from "@/components/admin/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = { title: "Admin — CASHPOT" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  // Eliminat redirect-ul pentru a repara bucla.

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex transition-colors duration-200">
          <AdminSidebar />
          <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen mt-14 md:mt-0">
            {children}
          </main>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
