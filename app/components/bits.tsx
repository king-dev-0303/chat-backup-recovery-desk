"use client";

import { CircleCheck, Lock, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { iniciais, tomChance, type EstadoArquivo } from "@/lib/data";

export const btnPrimario = "glow-petroleo h-11 rounded-2xl border-0 px-5 text-sm font-semibold";
export const btnVerde = "glow-verde h-11 rounded-2xl border-0 px-5 text-sm font-bold";
export const btnGlass = "h-11 rounded-2xl border-white/80 bg-white/60 px-5 text-sm font-semibold text-tinta backdrop-blur hover:bg-white/90";
export const tabList = "h-auto flex-wrap justify-start gap-1 rounded-2xl bg-white/55 p-1 group-data-horizontal/tabs:h-auto border border-white/80";
export const tabCls = "h-10 rounded-xl px-3.5 text-sm font-semibold text-tinta/70 data-active:bg-petroleo data-active:text-white data-active:shadow-md";
export const dlg = "glass-pop rounded-[1.75rem] border-0 p-6 text-tinta";

const TONS = {
  verde: "border-verde/30 bg-verde/14 text-[#0a6b43]",
  azul: "border-ceu/30 bg-ceu/12 text-[#1d5f93]",
  ambar: "border-ambar/45 bg-ambar/20 text-[#8a5306]",
  risco: "border-risco/35 bg-risco/12 text-[#a3352c]",
  cinza: "border-tinta/15 bg-tinta/7 text-tinta/70",
  foto: "chip-foto",
  claro: "border-white/35 bg-white/16 text-white",
};

export function Chip({ children, tom = "cinza", className }: { children: React.ReactNode; tom?: keyof typeof TONS; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-none font-semibold whitespace-nowrap", TONS[tom], className)}>{children}</span>;
}

export function Avatar({ nome, src, className }: { nome: string; src?: string; className?: string }) {
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-petroleo to-ceu text-xs font-bold text-white ring-2 ring-white/90", className)}>
      {src ? <img src={src} alt={`Foto de ${nome}`} className="size-full object-cover" /> : iniciais(nome)}
    </span>
  );
}

export function Vazio({ icone: Icon, titulo, texto, children }: { icone: LucideIcon; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-petroleo/12 text-petroleo"><Icon className="size-6" /></span>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{texto}</p>
      {children}
    </div>
  );
}

const COR = { alta: "#1fbf75", media: "#f0a243", baixa: "#e2574c" };
const ROTULO = { alta: "Chance alta", media: "Chance média", baixa: "Chance baixa" };

/** Anel de chance: número, cor e rótulo juntos, nunca só a cor. */
export function Chance({ valor, tamanho = "md", escuro }: { valor: number; tamanho?: "md" | "lg"; escuro?: boolean }) {
  const tom = tomChance(valor);
  return (
    <div className="flex flex-col items-center gap-1.5" role="img" aria-label={`${ROTULO[tom]}: ${valor}%`}>
      <span className={cn("anel flex items-center justify-center", tamanho === "lg" ? "size-28 p-2" : "size-[4.6rem] p-1.5")} style={{ "--v": valor, "--cor": COR[tom] } as React.CSSProperties}>
        <span className={cn("flex size-full flex-col items-center justify-center rounded-full", escuro ? "bg-fundo text-white" : "bg-white/92 text-tinta")}>
          <b className={cn("font-heading tabular leading-none", tamanho === "lg" ? "text-3xl" : "text-xl")}>{valor}<span className="text-[0.55em] font-semibold">%</span></b>
        </span>
      </span>
      <span className={cn("text-[11px] font-semibold", escuro ? "text-white/80" : "text-muted-foreground")}>{ROTULO[tom]}</span>
    </div>
  );
}

const ESTADOS: Record<EstadoArquivo, { nome: string; tom: keyof typeof TONS; icone: LucideIcon }> = {
  integro: { nome: "Íntegro", tom: "verde", icone: CircleCheck },
  parcial: { nome: "Parcial", tom: "ambar", icone: TriangleAlert },
  vazio: { nome: "Quase vazio", tom: "risco", icone: TriangleAlert },
  cifrado: { nome: "Cifrado", tom: "azul", icone: Lock },
};

export function EstadoChip({ estado }: { estado: EstadoArquivo }) {
  const e = ESTADOS[estado];
  return <Chip tom={e.tom}><e.icone className="size-3" /> {e.nome}</Chip>;
}

/** Cabeçalho padrão de cada etapa do caso. */
export function Topo({ passo, titulo, texto, children }: { passo: string; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <Chip tom="verde" className="mb-3">{passo}</Chip>
        <h1 className="text-3xl font-semibold text-balance sm:text-[2.5rem] sm:leading-[1.1]">{titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{texto}</p>
      </div>
      {children}
    </div>
  );
}
