import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Receipt,
  Users,
  BarChart3,
  Percent,
} from "lucide-react";

export type Role = "owner" | "kasir";

export const sidebarMenu: Record<
  Role,
  {
    label: string;
    href: string;
    icon: any;
  }[]
> = {
  owner: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Produk",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Kategori",
      href: "/dashboard/categories",
      icon: Layers,
    },
    {
      label: "Transaksi",
      href: "/dashboard/transactions",
      icon: Receipt,
    },
    {
      label: "Diskon",
      href: "/dashboard/discounts",
      icon: Percent,
    },
    {
      label: "Laporan",
      href: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      label: "User",
      href: "/dashboard/users",
      icon: Users,
    },
  ],

  kasir: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Transaksi",
      href: "/dashboard/transactions/create",
      icon: ShoppingCart,
    },
    {
      label: "Diskon",
      href: "/dashboard/discounts",
      icon: Percent,
    },
    {
      label: "Riwayat Transaksi",
      href: "/dashboard/transactions",
      icon: Receipt,
    },
  ],
};
