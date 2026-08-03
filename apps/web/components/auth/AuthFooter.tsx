import Link from "next/link";

type AuthFooterProps = {
  prompt: string;
  actionLabel: string;
  href: string;
};

export function AuthFooter({ prompt, actionLabel, href }: AuthFooterProps) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="font-semibold text-primary transition-colors hover:text-primary/80"
      >
        {actionLabel}
      </Link>
    </p>
  );
}
