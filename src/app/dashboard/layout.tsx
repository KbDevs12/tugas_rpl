import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
  description: "Dashboard Frendo POS System",
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }
  return (
    <SidebarProvider>
      <AppSidebar role={session.role} />
      <main className="flex-1 w-full">
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <SidebarTrigger />
        </div>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
