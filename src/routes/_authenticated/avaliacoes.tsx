import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, NextStage } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/avaliacoes")({
  head: () => ({ meta: [{ title: "Avaliações — PSIQUE VR" }, { name: "description", content: "Registros de avaliação autorrelatada." }] }),
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Avaliações" description="Registros de avaliação autorrelatada." />
      <NextStage title="Avaliações" items={["Escalas autorrelatadas antes e depois da sessão", "Histórico por paciente"]} />
    </div>
  ),
});
