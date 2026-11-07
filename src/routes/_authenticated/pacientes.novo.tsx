import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/AppShell";
import { PatientForm } from "@/components/patients/PatientForm";
import { ageFromBirthDate, isMinor } from "@/lib/patients";

export const Route = createFileRoute("/_authenticated/pacientes/novo")({
  head: () => ({ meta: [{ title: "Novo paciente — PSIQUE VR" }, { name: "description", content: "Cadastrar paciente." }] }),
  component: NewPatient,
});

function NewPatient() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Novo paciente" description="Para menores de idade, cadastre o responsável legal em seguida." />
      <PatientForm
        submitLabel="Cadastrar paciente"
        onSubmit={async (v) => {
          const { data, error } = await supabase.from("patients").insert({
            ...v, therapeutic_goals: v.therapeutic_goals || null, professional_notes: v.professional_notes || null,
          }).select("id").single();
          if (error) {
            toast.error(error.code === "23505" ? "Identificador já utilizado." : error.message);
            return;
          }
          qc.invalidateQueries();
          toast.success(isMinor(ageFromBirthDate(v.birth_date)) ? "Paciente cadastrado. Adicione o responsável legal." : "Paciente cadastrado.");
          navigate({ to: "/pacientes/$id", params: { id: data.id } });
        }}
      />
    </div>
  );
}
