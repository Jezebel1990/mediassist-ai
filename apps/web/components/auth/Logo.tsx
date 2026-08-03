import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
        <Activity
          className="h-7 w-7 text-white"
          strokeWidth={2.5}
        />
      </div>

      <span className="text-2xl font-semibold text-gray-800">
        MediAssist AI
      </span>
    </div>
  );
}