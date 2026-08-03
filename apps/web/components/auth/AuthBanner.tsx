import Image from "next/image";
import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthBannerProps = {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  description: string;
  showIcon?: boolean;
  className?: string;
};

export function AuthBanner({
  imageSrc,
  imageAlt = "",
  title,
  description,
  showIcon = true,
  className,
}: AuthBannerProps) {
  return (
    <aside
      className={cn(
        "relative hidden h-full min-h-screen overflow-hidden md:block",
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,110,253,.8) 0%, rgba(13,110,253,.6) 100%)",
        }}
        aria-hidden
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center p-12 text-center text-white">
        <div className="max-w-md space-y-6">
          {showIcon ? (
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Activity className="h-12 w-12 text-white" strokeWidth={2} />
            </div>
          ) : null}

          <h2 className="whitespace-pre-line text-4xl font-semibold leading-[1.3] tracking-normal">
            {title}
          </h2>

          <p className="text-base leading-7 text-white/95">{description}</p>
        </div>
      </div>
    </aside>
  );
}
