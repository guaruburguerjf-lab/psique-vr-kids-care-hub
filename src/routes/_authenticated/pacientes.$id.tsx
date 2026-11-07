import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/AppShell";
import { PatientForm } from "@/components/patients/PatientForm";
import { GuardianSection } from "@/components/patients/GuardianSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ageFromBirthDate, ageRange, canUseVr, isMinor } from "@/lib/patients";

export const Route = createFileRoute("/_authenticated/pacientes/$id")({
  head: () => ({ meta: [{ title: "Paciente — PSIQUE VR" }, { name: "description", content: "Ficha do paciente." }] }),
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!p) return <p>Paciente não encontrado. <Link to="/pacientes" className="text-primary">Voltar</Link></p>;

  const age = ageFromBirthDate(p.birth_date);

  async function remove() {
    if (!confirm("Excluir definitivamente este paciente e todos os registros vinculados?")) return;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries();
    toast.success("Paciente excluído.");
    navigate({ to: "/pacientes" });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/pacientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pacientes</Link>
      <PageHeader
        title={p.full_name}
        description={`${p.internal_code} · ${age} anos · ${ageRange(age)} · cadastrado em ${new Date(p.created_at).toLocaleDateString("pt-BR")}`}
        actions={<Button variant="ghost" onClick={remove}><Trash2 /> Excluir</Button>}
      />
      <div className="flex flex-wrap gap-2">
        {p.is_demo && <Badge variant="outline">Dados de demonstração</Badge>}
        {canUseVr(age)
          ? <Badge>Apto ao headset</Badge>
          : <Badge variant="destructive">Headset bloqueado — idade abaixo do mínimo da Meta. Modalidade em tela convencional (em breve).</Badge>}
      </div>
      <PatientForm
        submitLabel="Salvar alterações"
        initial={{
          internal_code: p.internal_code, full_name: p.full_name, birth_date: p.birth_date, modality: p.modality,
          therapeutic_goals: p.therapeutic_goals ?? "", consent_status: p.consent_status, professional_notes: p.professional_notes ?? "",
        }}
        onSubmit={async (v) => {
          const { error } = await supabase.from("patients").update({
            ...v, therapeutic_goals: v.therapeutic_goals || null, professional_notes: v.professional_notes || null,
          }).eq("id", id);
          if (error) return void toast.error(error.code === "23505" ? "Identificador já utilizado." : error.message);
          qc.invalidateQueries();
          toast.success("Alterações salvas.");
        }}
      />
      <GuardianSection patientId={id} required={isMinor(age)} />
    </div>
  );
}
