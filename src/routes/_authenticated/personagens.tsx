import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, NextStage } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/personagens")({
  head: () => ({ meta: [{ title: "Personagens IA — PSIQUE VR" }, { name: "description", content: "Personagens educativos." }] }),
  component: Characters,
});

function Characters() {
  const { data } = useQuery({
    queryKey: ["ai-characters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_characters").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Personagens IA" description="Personagens educativos com conteúdo aprovado pelo psicólogo." />
      {data?.map((c) => (
        <div key={c.id} className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-gold" />
            <h2 className="text-3xl font-semibold">{c.name}</h2>
            <Badge variant="secondary">{c.enabled_for_patients ? "Habilitado" : "Desativado para pacientes"}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">{c.description}</p>
          <p className="mt-2 text-sm">{c.persona}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Sem diagnósticos, prescrições, coleta de dados pessoais ou armazenamento de conversas. Encerra e chama o profissional diante de sinais de risco.
          </p>
        </div>
      ))}
      <NextStage title="Conversa com a IA" items={["Comunicação segura com o provedor de IA pelo servidor", "Filtros de segurança e limite de interações", "Habilitação somente após testes e aprovação"]} />
    </div>
  );
}
