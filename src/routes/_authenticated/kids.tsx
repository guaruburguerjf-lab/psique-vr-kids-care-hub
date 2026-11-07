import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, NextStage } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated/kids")({
  head: () => ({ meta: [{ title: "PSIQUE KIDS — PSIQUE VR" }, { name: "description", content: "Módulo infantil com experiências lúdicas." }] }),
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="PSIQUE KIDS" description="Módulo infantil com experiências lúdicas." />
      <NextStage title="PSIQUE KIDS" items={["Ilha das Emoções, Floresta da Coragem, Oceano da Calma, Escola dos Amigos, Castelo dos Sonhos", "Bloqueio de headset abaixo de 10 anos (já aplicado no banco)", "Modalidade em tela convencional para crianças menores"]} />
    </div>
  ),
});
