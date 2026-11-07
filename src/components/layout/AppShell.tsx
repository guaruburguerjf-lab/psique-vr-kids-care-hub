import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Users, CalendarClock, Glasses, Baby, Sparkles, ClipboardList, FileText, Settings, LogOut, ShieldAlert,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/sessoes", label: "Sessões", icon: CalendarClock },
  { to: "/experiencias", label: "Experiências VR", icon: Glasses },
  { to: "/kids", label: "PSIQUE KIDS", icon: Baby },
  { to: "/personagens", label: "Personagens IA", icon: Sparkles },
  { to: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return Boolean(data);
    },
  });
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin, isLoading } = useIsAdmin();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3 py-5">
          <Logo className="text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(to)} tooltip={label}>
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} tooltip="Sair">
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Psicologia além dos limites da realidade</span>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          {!isLoading && isAdmin === false ? (
            <div className="mx-auto mt-16 max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
              <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
              <h2 className="mt-4 text-2xl font-semibold">Acesso não autorizado</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta conta não possui permissão de psicólogo administrador.
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function NextStage({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Próxima etapa de entrega</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A estrutura no banco de dados já está criada e protegida. As telas abaixo serão implementadas na sequência:
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
