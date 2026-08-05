import type { LucideIcon } from "lucide-react";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Assistente",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    label: "Base de Conhecimento",
    href: "/dashboard/knowledge",
    icon: FileText,
  },
];

export const dashboardLogoutItem: NavItem = {
  label: "Sair",
  href: "/login",
  icon: LogOut,
};
