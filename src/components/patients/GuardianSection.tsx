import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { guardianSchema, type GuardianInput } from "@/lib/patients";

const empty: GuardianInput = {
  full_name: "", relationship: "", document: "", phone: "", email: "",
  is_legal_guardian: true, authorization_granted: false, authorization_date: "", authorization_notes: "",
};

export function GuardianSection({ patientId, required }: { patientId: string; required: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<GuardianInput>(empty);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof GuardianInput>(k: K, val: GuardianInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const key = ["guardians", patientId];
  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("guardians").select("*").eq("patient_id", patientId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = guardianSchema.safeParse(v);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
    const g = parsed.data;
    setBusy(true);
    const { error } = await supabase.from("guardians").insert({
      patient_id: patientId,
      full_name: g.full_name, relationship: g.relationship,
      document: g.document || null, phone: g.phone || null, email: g.email || null,
      is_legal_guardian: g.is_legal_guardian, authorization_granted: g.authorization_granted,
      authorization_date: g.authorization_granted ? g.authorization_date || new Date().toISOString().slice(0, 10) : null,
      authorization_notes: g.authorization_notes || null,
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Responsável cadastrado.");
    setV(empty); setOpen(false);
    qc.invalidateQueries({ queryKey: key });
  }

  async function remove(id: string) {
    if (!confirm("Remover este responsável?")) return;
    const { error } = await supabase.from("guardians").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: key });
  }

  async function toggleAuth(id: string, granted: boolean) {
    const { error } = await supabase.from("guardians").update({
      authorization_granted: granted, authorization_date: granted ? new Date().toISOString().slice(0, 10) : null,
    }).eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: key });
  }

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Responsáveis legais</h2>
          {required && !data?.some((g) => g.is_legal_guardian && g.authorization_granted) && (
            <p className="mt-1 text-sm text-destructive">Paciente menor de idade: registre um responsável com autorização.</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setOpen((o) => !o)}><UserPlus /> Adicionar</Button>
      </div>

      <ul className="mt-4 divide-y">
        {data?.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <div className="font-medium">{g.full_name} <span className="text-sm text-muted-foreground">· {g.relationship}</span></div>
              <div className="text-xs text-muted-foreground">{[g.phone, g.email].filter(Boolean).join(" · ")}</div>
              <div className="mt-1 flex gap-2">
                {g.is_legal_guardian && <Badge variant="outline">Responsável legal</Badge>}
                {g.authorization_granted
                  ? <Badge>Autorizado em {g.authorization_date && new Date(g.authorization_date + "T00:00").toLocaleDateString("pt-BR")}</Badge>
                  : <Badge variant="secondary">Sem autorização</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={g.authorization_granted} onCheckedChange={(c) => toggleAuth(g.id, c)} /> Autorização
              </label>
              <Button size="icon" variant="ghost" onClick={() => remove(g.id)} aria-label="Remover"><Trash2 /></Button>
            </div>
          </li>
        ))}
        {!data?.length && <li className="py-3 text-sm text-muted-foreground">Nenhum responsável cadastrado.</li>}
      </ul>

      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-4 rounded-xl bg-muted/50 p-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Nome</Label><Input value={v.full_name} onChange={(e) => set("full_name", e.target.value)} /></div>
          <div className="space-y-2"><Label>Vínculo</Label><Input placeholder="Mãe, pai, tutor…" value={v.relationship} onChange={(e) => set("relationship", e.target.value)} /></div>
          <div className="space-y-2"><Label>Documento</Label><Input value={v.document} onChange={(e) => set("document", e.target.value)} /></div>
          <div className="space-y-2"><Label>Telefone</Label><Input value={v.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>E-mail</Label><Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={v.is_legal_guardian} onCheckedChange={(c) => set("is_legal_guardian", c)} /> Responsável legal</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={v.authorization_granted} onCheckedChange={(c) => set("authorization_granted", c)} /> Autorização registrada</label>
          {v.authorization_granted && (
            <div className="space-y-2"><Label>Data da autorização</Label><Input type="date" value={v.authorization_date} onChange={(e) => set("authorization_date", e.target.value)} /></div>
          )}
          <div className="space-y-2 md:col-span-2"><Label>Observações da autorização</Label><Textarea rows={2} value={v.authorization_notes} onChange={(e) => set("authorization_notes", e.target.value)} /></div>
          <div className="md:col-span-2"><Button type="submit" disabled={busy}>Salvar responsável</Button></div>
        </form>
      )}
    </section>
  );
}
