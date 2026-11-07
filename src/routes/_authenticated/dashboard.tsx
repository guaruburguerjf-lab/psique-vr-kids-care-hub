import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, CalendarCheck, CalendarClock, Glasses, UserPlus, Library, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PSIQUE VR" }, { name: "description", content: "Visão geral do consultório." }] }),
  component: Dashboard,
});

async function count(q: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

const actionLabel: Record<string, string> = { insert: "criado", update: "atualizado", delete: "removido" };
const entityLabel: Record<string, string> = {
  patients: "Paciente", guardians: "Responsável", consents: "Consentimento", sessions: "Sessão", clinical_notes: "Anotação clínica",
};

function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [patients, done, scheduled, experiences] = await Promise.all([
        count(supabase.from("patients").select("id", head)),
        count(supabase.from("sessions").select("id", head).eq("status", "concluida")),
        count(supabase.from("sessions").select("id", head).eq("status", "agendada")),
        count(supabase.from("experiences").select("id", head).eq("status", "publicado")),
      ]);
      return { patients, done, scheduled, experiences };
    },
  });
  const activity = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("id, action, entity, summary, created_at").order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data;
    },
  });

  const cards = [
    { label: "Pacientes cadastrados", value: stats.data?.patients, icon: Users },
    { label: "Sessões realizadas", value: stats.data?.done, icon: CalendarCheck },
    { label: "Sessões agendadas", value: stats.data?.scheduled, icon: CalendarClock },
    { label: "Experiências publicadas", value: stats.data?.experiences, icon: Glasses },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Dashboard" description="Visão geral do seu consultório." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-4xl font-semibold">{stats.isLoading ? "—" : value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">Acesso rápido</h2>
          <div className="mt-4 grid gap-2">
            <Button asChild className="justify-start"><Link to="/pacientes/novo"><UserPlus /> Cadastrar paciente</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link to="/experiencias"><Library /> Biblioteca 3D</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link to="/sessoes"><History /> Histórico de atendimentos</Link></Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">Atividades recentes</h2>
          {activity.data?.length ? (
            <ul className="mt-4 divide-y">
              {activity.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{entityLabel[a.entity] ?? a.entity} {actionLabel[a.action] ?? a.action}{a.summary && a.entity === "patients" ? ` · ${a.summary.replace("Paciente ", "")}` : ""}</span>
                  <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{activity.isLoading ? "Carregando…" : "Nenhuma atividade registrada ainda."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
