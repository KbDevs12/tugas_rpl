"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/logout";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import { Button } from "./ui/button";

import { sidebarMenu, Role } from "@/config/sidebar-menu";

type Props = {
  role: Role;
};

export default function AppSidebar({ role }: Props) {
  const pathname = usePathname();
  const menus = sidebarMenu[role];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 font-semibold text-lg">
        Frendo POS
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menus.map((menu: { label: string; href: string; icon: any }) => {
            const isActive =
              pathname === menu.href || pathname.startsWith(menu.href + "/");

            const Icon = menu.icon;

            return (
              <SidebarMenuItem key={menu.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={menu.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{menu.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full">
            Logout
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
