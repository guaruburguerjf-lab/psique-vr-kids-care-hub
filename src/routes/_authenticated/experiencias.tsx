import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/experiencias")({
  head: () => ({ meta: [{ title: "Experiências VR — PSIQUE VR" }, { name: "description", content: "Biblioteca de experiências imersivas." }] }),
  component: Experiences,
});

const statusLabel = { rascunho: "Em desenvolvimento", publicado: "Publicado", arquivado: "Arquivado" } as const;

function Experiences() {
  const { data, isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const { data, error } = await supabase.from("experiences").select("*").order("audience").order("name");
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Experiências VR" description="Recursos de apoio ao trabalho do psicólogo — não constituem tratamento comprovado sem validação clínica específica." />
      {isLoading && <p className="text-muted-foreground">Carregando…</p>}
      {(["adulto", "infantil"] as const).map((aud) => (
        <section key={aud} className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">{aud === "adulto" ? "Adultos" : "PSIQUE KIDS"}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.filter((e) => e.audience === aud).map((e) => (
              <article key={e.id} className="rounded-2xl border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-gold">{e.category}</span>
                  <Badge variant={e.status === "publicado" ? "default" : "secondary"}>{statusLabel[e.status]}</Badge>
                </div>
                <h3 className="mt-2 text-xl font-semibold">{e.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                <dl className="mt-3 space-y-1 text-xs">
                  <div><dt className="inline font-medium">Objetivo: </dt><dd className="inline text-muted-foreground">{e.objective}</dd></div>
                  <div><dt className="inline font-medium">Duração sugerida: </dt><dd className="inline text-muted-foreground">{e.suggested_duration_min} min · idade mín. {e.min_age}</dd></div>
                  <div><dt className="inline font-medium">Contraindicações: </dt><dd className="inline text-muted-foreground">{e.contraindications}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
