"use client";

import { Logo } from "@/components/brand";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  dashboardLogoutItem,
  dashboardNavItems,
} from "./constants";
import { SidebarNavItem } from "./SidebarNavItem";

type AppSidebarProps = {
  className?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function AppSidebar({
  className,
  collapsed = false,
  onNavigate,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/60 bg-card",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/60",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <Logo size={collapsed ? "compact" : "sm"} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {dashboardNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-3 p-3">
        <Separator className="bg-border/60" />
        <SidebarNavItem
          href={dashboardLogoutItem.href}
          label={dashboardLogoutItem.label}
          icon={dashboardLogoutItem.icon}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}
