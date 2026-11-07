import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — PSIQUE VR" }, { name: "description", content: "Perfil do administrador." }] }),
  component: Settings,
});

const schema = z.object({
  full_name: z.string().trim().max(200),
  crp: z.string().trim().max(30),
  phone: z.string().trim().max(30),
});

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [v, setV] = useState({ full_name: "", crp: "", phone: "" });
  useEffect(() => {
    if (data) setV({ full_name: data.full_name ?? "", crp: data.crp ?? "", phone: data.phone ?? "" });
  }, [data]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    const parsed = schema.safeParse(v);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", data.id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Perfil atualizado.");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" description="Perfil do psicólogo administrador." />
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6">
        <div className="space-y-2"><Label>E-mail</Label><Input value={data?.email ?? ""} disabled /></div>
        <div className="space-y-2"><Label>Nome completo</Label><Input value={v.full_name} onChange={(e) => setV({ ...v, full_name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Registro CRP</Label><Input value={v.crp} onChange={(e) => setV({ ...v, crp: e.target.value })} /></div>
        <div className="space-y-2"><Label>Telefone</Label><Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></div>
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  );
}
