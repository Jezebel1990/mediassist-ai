"use client";

import { useState } from "react";
import {
  CircleCheck,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";

import {
  KnowledgeBaseSection,
  StatsCard,
} from "@/components/dashboard";
import type { DocumentsStatusResponse } from "@/services/documents.service";

function shortModelName(modelName: string | undefined): string {
  if (!modelName) {
    return "—";
  }
  const withoutProvider = modelName.includes("/")
    ? modelName.split("/").pop() ?? modelName
    : modelName;
  return withoutProvider.replace(/:free$/i, "");
}

function formatLastIndexed(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function operationalLabel(status: DocumentsStatusResponse | null): string {
  if (!status) {
    return "—";
  }
  if (status.failed > 0) {
    return "Atenção";
  }
  if (status.index_exists || status.indexed > 0) {
    return "Operacional";
  }
  if (status.total === 0) {
    return "Vazio";
  }
  return "Pendente";
}

export default function DashboardPage() {
  const [status, setStatus] = useState<DocumentsStatusResponse | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Documentos Indexados"
          value={status ? String(status.indexed) : "—"}
          description="Arquivos disponíveis para consulta"
          icon={FileText}
        />
        <StatsCard
          title="Modelo IA"
          value={shortModelName(status?.model_name)}
          description="Modelo ativo para respostas"
          icon={MessageSquare}
        />
        <StatsCard
          title="Status"
          value={operationalLabel(status)}
          description="Todos os serviços online"
          icon={CircleCheck}
        />
        <StatsCard
          title="Última Atualização"
          value={formatLastIndexed(status?.last_indexed_at)}
          description="Base sincronizada recentemente"
          icon={Clock}
        />
      </section>

      <section id="knowledge-base">
        <KnowledgeBaseSection onStatusChange={setStatus} />
      </section>
    </div>
  );
}
