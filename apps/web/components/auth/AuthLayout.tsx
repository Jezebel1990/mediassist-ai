import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: ReactNode;
  banner: ReactNode;
  className?: string;
};

export function AuthLayout({ children, banner, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "grid min-h-screen w-full bg-background md:grid-cols-2",
        className,
      )}
    >
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </main>
      {banner}
    </div>
  );
}
