import { MessageSquare } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-center py-16">
      <Card className="w-full border-border/60 text-center shadow-md">
        <CardHeader className="items-center gap-3 py-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="size-6" strokeWidth={1.75} />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Chat IA
          </CardTitle>
          <CardDescription className="max-w-sm">
            O assistente de conversação com a base de conhecimento estará
            disponível em breve.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
