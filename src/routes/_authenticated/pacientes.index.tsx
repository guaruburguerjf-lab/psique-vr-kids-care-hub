import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ageFromBirthDate, canUseVr, consentLabel } from "@/lib/patients";

export const Route = createFileRoute("/_authenticated/pacientes/")({
  head: () => ({ meta: [{ title: "Pacientes — PSIQUE VR" }, { name: "description", content: "Cadastro de pacientes." }] }),
  component: PatientsList,
});

function PatientsList() {
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients")
        .select("id, internal_code, full_name, birth_date, modality, consent_status, is_demo, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const rows = (data ?? []).filter((p) => (p.full_name + p.internal_code).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Pacientes"
        description="Dados cadastrais protegidos e visíveis apenas para você."
        actions={<Button asChild><Link to="/pacientes/novo"><UserPlus /> Novo paciente</Link></Button>}
      />
      <Input placeholder="Buscar por nome ou identificador" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr><th className="p-3">Identificador</th><th className="p-3">Nome</th><th className="p-3">Idade</th><th className="p-3">Modalidade</th><th className="p-3">Consentimento</th><th className="p-3">VR</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const age = ageFromBirthDate(p.birth_date);
              return (
                <tr key={p.id} className="border-t hover:bg-accent/40">
                  <td className="p-3 font-mono text-xs">{p.internal_code}</td>
                  <td className="p-3">
                    <Link to="/pacientes/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.full_name}</Link>
                    {p.is_demo && <Badge variant="outline" className="ml-2">Demonstração</Badge>}
                  </td>
                  <td className="p-3">{age}</td>
                  <td className="p-3 capitalize">{p.modality}</td>
                  <td className="p-3">{consentLabel[p.consent_status]}</td>
                  <td className="p-3">{canUseVr(age) ? <Badge>Apto</Badge> : <Badge variant="secondary">Tela</Badge>}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                {isLoading ? "Carregando…" : error ? "Não foi possível carregar." : "Nenhum paciente cadastrado."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
