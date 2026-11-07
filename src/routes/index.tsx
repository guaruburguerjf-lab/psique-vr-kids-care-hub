import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ShieldCheck, Waves, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PSIQUE VR + PSIQUE KIDS — Psicologia além dos limites da realidade" },
      { name: "description", content: "Plataforma clínica de realidade virtual para o consultório de psicologia, com Meta Quest 3S." },
      { property: "og:title", content: "PSIQUE VR + PSIQUE KIDS" },
      { property: "og:description", content: "Psicologia além dos limites da realidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-hero text-sidebar-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Button asChild variant="secondary">
          <Link to="/auth">Acesso do psicólogo</Link>
        </Button>
      </header>
      <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Uso clínico exclusivo</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] text-sidebar-accent-foreground md:text-7xl">
            Psicologia além dos limites da realidade.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sidebar-foreground/80">
            Ambientes imersivos, personagens educativos e acompanhamento de sessões em uma plataforma
            segura, pensada para o consultório e para o Meta Quest 3S.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">Entrar no painel</Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {[
            { icon: Waves, t: "Experiências imersivas", d: "Biblioteca para adultos e PSIQUE KIDS, iniciando pelo Oceano da Calma." },
            { icon: ShieldCheck, t: "Privacidade por padrão", d: "Acesso restrito ao psicólogo, registros de auditoria e consentimentos (LGPD/ECA)." },
            { icon: Sparkles, t: "LUMI, o guia educativo", d: "Personagem com conteúdos aprovados pelo profissional. Desativado até validação." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-5 backdrop-blur">
              <Icon className="h-5 w-5 text-sidebar-primary" />
              <h3 className="mt-3 text-xl font-semibold text-sidebar-accent-foreground">{t}</h3>
              <p className="mt-1 text-sm text-sidebar-foreground/75">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
