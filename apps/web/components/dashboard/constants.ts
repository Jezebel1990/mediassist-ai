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
    label: "Chat IA",
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

export type DocumentStatus =
  | "indexado"
  | "processando"
  | "pendente"
  | "falhou";

export type KnowledgeDocument = {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadedAt: string;
  type: string;
  chunks: number;
};

export const mockUser = {
  name: "Dra. Ana Silva",
  initials: "AS",
  email: "ana.silva@clinica.com",
};

export const ACCEPTED_DOCUMENT_TYPES = [
  ".pdf",
  ".csv",
  ".docx",
  ".xlsx",
  ".pptx",
  ".json",
  ".html",
  ".htm",
  ".md",
  ".markdown",
].join(",");
