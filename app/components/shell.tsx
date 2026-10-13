"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArchiveRestore, Check, ChevronDown, FileDown, MessagesSquare, Radar, RotateCcw, Route, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/bits";
import { cn } from "@/lib/utils";
import { CASO } from "@/lib/data";
import { useStore } from "@/lib/store";

export function Shell({ children }: { children: React.ReactNode }) {
  const { diagFeito, congelado, varredura, entregue, reiniciar } = useStore();
  const rota = usePathname();
  const router = useRouter();

  const etapas = [
    { href: "/diagnostico", nome: "Diagnóstico", icone: Stethoscope, feito: diagFeito },
    { href: "/plano", nome: "Plano", icone: Route, feito: congelado.length === 5 },
    { href: "/varredura", nome: "Varredura", icone: Radar, feito: varredura === "concluida" },
    { href: "/conversas", nome: "Conversas", icone: MessagesSquare, feito: varredura === "concluida" },
    { href: "/entrega", nome: "Entrega", icone: FileDown, feito: entregue },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <div className="glass-nav mx-auto flex max-w-7xl items-center gap-3 rounded-[1.4rem] px-3 py-2.5 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Resgata - início">
            <span className="glow-petroleo flex size-10 items-center justify-center rounded-2xl"><ArchiveRestore className="size-5" /></span>
            <span className="font-heading text-xl font-bold tracking-tight">resgata</span>
          </Link>
          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Etapas do caso">
            {etapas.map((n, i) => {
              const ativo = rota.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={ativo ? "step" : undefined}
                  className={cn("flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-tinta/65 transition hover:bg-white/70 hover:text-tinta", ativo && "bg-white/90 text-petroleo shadow-sm")}>
                  <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold", n.feito ? "bg-verde text-white" : ativo ? "bg-petroleo text-white" : "bg-tinta/10 text-tinta/60")}>
                    {n.feito ? <Check className="size-3" /> : i + 1}
                  </span>
                  {n.nome}
                </Link>
              );
            })}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="ml-auto h-11 gap-2 rounded-2xl px-1.5 hover:bg-white/70 lg:ml-0" />}>
              <Avatar nome={CASO.cliente} src={CASO.avatar} className="size-8" />
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold">{CASO.cliente.split(" ")[0]}</span>
                <span className="block text-[11px] text-muted-foreground">Caso {CASO.id}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-pop w-64 rounded-2xl p-1.5">
              <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{CASO.negocio}</p>
              <DropdownMenuItem onClick={() => router.push("/diagnostico")} className="h-10 gap-2.5 rounded-xl px-2.5 font-medium">
                <Stethoscope className="size-4 text-petroleo" /> Refazer o diagnóstico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { reiniciar(); router.push("/"); toast.success("Caso de demonstração reiniciado"); }} className="h-10 gap-2.5 rounded-xl px-2.5 font-medium">
                <RotateCcw className="size-4 text-petroleo" /> Reiniciar a demonstração
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 pt-6 pb-28 sm:px-6 lg:pb-14">{children}</main>

      <footer className="mx-auto hidden w-full max-w-7xl px-6 pb-8 lg:block">
        <div className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><ArchiveRestore className="size-4 text-petroleo" /> Resgata - recuperação de conversas e mídias, sempre numa cópia do original</span>
          <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-petroleo" /> Seus dados ficam só no caso e são apagados quando você pedir</span>
        </div>
      </footer>

      <nav className="glass-nav fixed inset-x-3 bottom-3 z-40 flex justify-between rounded-[1.4rem] p-1.5 lg:hidden" aria-label="Etapas do caso">
        {etapas.map((n) => {
          const ativo = rota.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} aria-current={ativo ? "step" : undefined}
              className={cn("relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold text-tinta/65", ativo && "bg-petroleo text-white")}>
              <n.icone className="size-5" /> {n.nome}
              {n.feito && !ativo && <span className="absolute top-1.5 right-[22%] size-2 rounded-full bg-verde ring-2 ring-white" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
