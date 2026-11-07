import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, NextStage } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/sessoes")({
  head: () => ({ meta: [{ title: "Sessões — PSIQUE VR" }, { name: "description", content: "Agendamento e condução de atendimentos." }] }),
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Sessões" description="Agendamento e condução de atendimentos." />
      <NextStage title="Sessões" items={["Selecionar paciente, objetivo e experiência", "Configurar duração, iniciar, interromper e encerrar", "Códigos temporários de acesso de uso único", "Registro de eventos e observações"]} />
    </div>
  ),
});
