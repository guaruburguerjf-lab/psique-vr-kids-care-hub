import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ageFromBirthDate, ageRange, canUseVr, isMinor, patientSchema, type PatientInput } from "@/lib/patients";

const empty: PatientInput = {
  internal_code: "", full_name: "", birth_date: "", modality: "adulto",
  therapeutic_goals: "", consent_status: "pendente", professional_notes: "",
};

export function PatientForm({ initial, onSubmit, submitLabel }: {
  initial?: Partial<PatientInput>;
  onSubmit: (v: PatientInput) => Promise<void>;
  submitLabel: string;
}) {
  const [v, setV] = useState<PatientInput>({ ...empty, ...initial } as PatientInput);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof PatientInput>(k: K, val: PatientInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const age = v.birth_date ? ageFromBirthDate(v.birth_date) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = patientSchema.safeParse(v);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try { await onSubmit(parsed.data); } finally { setBusy(false); }
  }

  const err = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border bg-card p-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="code">Identificador interno</Label>
        <Input id="code" value={v.internal_code} onChange={(e) => set("internal_code", e.target.value)} placeholder="Ex.: PAC-0001" />
        {err("internal_code")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={v.full_name} onChange={(e) => set("full_name", e.target.value)} />
        {err("full_name")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="birth">Data de nascimento</Label>
        <Input id="birth" type="date" value={v.birth_date} onChange={(e) => set("birth_date", e.target.value)} />
        {err("birth_date")}
        {age !== null && age >= 0 && (
          <p className="text-xs text-muted-foreground">
            {age} anos · {ageRange(age)} · {canUseVr(age) ? "Apto ao headset" : "Headset não permitido (mín. 10 anos)"}
            {isMinor(age) && " · Exige responsável legal"}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Modalidade</Label>
        <Select value={v.modality} onValueChange={(x) => set("modality", x as PatientInput["modality"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="adulto">Adulto</SelectItem>
            <SelectItem value="infantil">Infantil (PSIQUE KIDS)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Situação do consentimento</Label>
        <Select value={v.consent_status} onValueChange={(x) => set("consent_status", x as PatientInput["consent_status"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="concedido">Concedido</SelectItem>
            <SelectItem value="revogado">Revogado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="goals">Objetivos terapêuticos</Label>
        <Textarea id="goals" rows={3} value={v.therapeutic_goals ?? ""} onChange={(e) => set("therapeutic_goals", e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Observações profissionais</Label>
        <Textarea id="notes" rows={4} value={v.professional_notes ?? ""} onChange={(e) => set("professional_notes", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={busy}>{busy ? "Salvando…" : submitLabel}</Button>
      </div>
    </form>
  );
}
