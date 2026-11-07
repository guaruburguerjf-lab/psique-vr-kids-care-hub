import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, NextStage } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — PSIQUE VR" }, { name: "description", content: "Relatórios profissionais de sessões." }] }),
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Relatórios" description="Relatórios profissionais de sessões." />
      <NextStage title="Relatórios" items={["Paciente, data, experiência e duração", "Avaliação autorrelatada e observações do psicólogo", "Sem diagnósticos ou conclusões automáticas"]} />
    </div>
  ),
});
