"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  collapsed = false,
  onNavigate,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    collapsed && "justify-center px-2",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  );

  if (href === "/login") {
    return (
      <button
        type="button"
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={cn(className, "w-full text-left")}
      >
        <Icon className="size-5 shrink-0" strokeWidth={1.75} />
        {!collapsed && <span>{label}</span>}
        {collapsed && <span className="sr-only">{label}</span>}
      </button>
    );
  }

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={className}
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span>{label}</span>}
      {collapsed && <span className="sr-only">{label}</span>}
    </Link>
  );
}
