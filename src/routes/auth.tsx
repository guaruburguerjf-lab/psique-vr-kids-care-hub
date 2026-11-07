import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — PSIQUE VR" },
      { name: "description", content: "Acesso exclusivo do psicólogo à plataforma PSIQUE VR." },
      { property: "og:title", content: "Entrar — PSIQUE VR" },
      { property: "og:description", content: "Acesso exclusivo do psicólogo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Se o e-mail estiver cadastrado, você receberá o link de recuperação.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-hero p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <h1 className="text-5xl font-semibold leading-tight text-sidebar-accent-foreground">
            Psicologia além dos limites da realidade.
          </h1>
          <p className="mt-4 max-w-md text-sidebar-foreground/75">Ambiente restrito ao profissional responsável.</p>
        </div>
        <p className="text-xs text-sidebar-foreground/60">Dados protegidos conforme LGPD, ECA e normas do CFP.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h2 className="text-3xl font-semibold">{mode === "login" ? "Acesso do psicólogo" : "Recuperar senha"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" ? "Entre com seu e-mail e senha." : "Enviaremos um link para redefinir sua senha."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode === "login" && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Enviar link"}
          </Button>
          <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "login" ? "forgot" : "login")}>
            {mode === "login" ? "Esqueci minha senha" : "Voltar ao login"}
          </button>
          <p className="text-center text-xs text-muted-foreground">Não há cadastro público. O acesso é criado pelo administrador.</p>
        </form>
      </div>
    </div>
  );
}
