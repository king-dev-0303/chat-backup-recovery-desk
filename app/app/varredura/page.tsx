"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, FolderOpen, Hash, HardDrive, LoaderCircle, MessagesSquare, Pause, Play, Radar, RotateCcw, Route, Terminal } from "lucide-react";
import { SiGoogledrive } from "react-icons/si";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Chip, EstadoChip, Topo, Vazio, btnGlass, btnPrimario, btnVerde } from "@/components/bits";
import { cn } from "@/lib/utils";
import { ARQUIVOS, ETAPAS_VARREDURA, LOG, RESUMO, fmtData, fmtN } from "@/lib/data";
import { useStore } from "@/lib/store";

const ICONE_ORIGEM = { local: HardDrive, drive: SiGoogledrive, midia: FolderOpen };

export default function VarreduraPage() {
  const { pronto, congelado, varredura, progresso, setVarredura, setProgresso } = useStore();
  const caixaLog = useRef<HTMLDivElement>(null);
  const p = useRef(progresso);
  p.current = progresso;

  useEffect(() => {
    if (varredura !== "rodando") return;
    const t = setInterval(() => {
      const n = Math.min(100, p.current + 1);
      if (n >= 100) {
        setVarredura("concluida", 100);
        toast.success("Varredura concluída", { description: `${fmtN(RESUMO.mensagens)} mensagens abertas na cópia de 3 de outubro.` });
      } else setProgresso(n);
    }, 170);
    return () => clearInterval(t);
  }, [varredura, setVarredura, setProgresso]);

  // Rola só a caixa do registro, nunca a página.
  useEffect(() => { const c = caixaLog.current; if (c) c.scrollTop = c.scrollHeight; }, [progresso]);

  if (!pronto) return <div className="space-y-4"><Skeleton className="h-24 rounded-3xl bg-white/50" /><Skeleton className="h-96 rounded-3xl bg-white/50" /></div>;

  if (congelado.length < 5 && varredura === "parada") {
    return (
      <Vazio icone={Route} titulo="A varredura começa pelo plano" texto="Antes de ler qualquer coisa, o original precisa estar protegido. Marque os cinco itens de preservação no plano.">
        <Link href="/plano" className={cn(buttonVariants(), btnPrimario, "mt-2")}>Ir pro plano <ArrowRight className="size-4" /></Link>
      </Vazio>
    );
  }

  const feita = varredura === "concluida";
  const rodando = varredura === "rodando";
  const achados = ARQUIVOS.filter((a) => a.em <= progresso);
  const linhas = LOG.filter((l) => l.em <= progresso);
  const etapaAtual = ETAPAS_VARREDURA.findIndex((e) => progresso < e.ate);

  return (
    <div>
      <Topo passo="Etapa 3 de 5" titulo="Varredura das fontes" texto="Leitura do aparelho, da conta e das mídias. Cada arquivo encontrado entra com data, tamanho e hash, pra saber qual cópia vale a pena abrir.">
        <div className="flex gap-2">
          {!feita && (
            <Button onClick={() => setVarredura(rodando ? "pausada" : "rodando")} variant="outline" className={btnGlass}>
              {rodando ? <><Pause className="size-4" /> Pausar</> : <><Play className="size-4" /> {progresso > 0 ? "Retomar" : "Iniciar"}</>}
            </Button>
          )}
          {feita && <Button onClick={() => setVarredura("rodando", 0)} variant="outline" className={btnGlass}><RotateCcw className="size-4" /> Rodar de novo</Button>}
          {feita && <Link href="/conversas" className={cn(buttonVariants(), btnVerde, "sheen relative")}><MessagesSquare className="size-4" /> Abrir as conversas <ArrowRight className="size-4" /></Link>}
        </div>
      </Topo>

      <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
        <section className="glass-noite relative overflow-hidden rounded-[1.75rem] p-5" aria-label="Andamento">
          <img src="/img/placa.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="relative">
            <div className="relative mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-full border border-menta/30 bg-fundo/50">
              <span className="radar-aneis absolute inset-0 rounded-full" />
              {rodando && <span className="radar-cone absolute inset-0 rounded-full" />}
              {achados.slice(-6).map((a, i) => (
                <span key={a.id} className={cn("absolute size-2.5 rounded-full", a.estado === "integro" ? "bg-verde" : a.estado === "parcial" ? "bg-ambar" : "bg-risco", rodando && "animate-pulso")}
                  style={{ top: `${22 + ((i * 37) % 56)}%`, left: `${18 + ((i * 53) % 62)}%` }} />
              ))}
              <div className="relative text-center">
                <p className="font-heading tabular text-5xl font-bold" aria-live="polite">{progresso}<span className="text-2xl">%</span></p>
                <p className="mt-1 text-xs font-semibold text-menta">{feita ? "concluída" : rodando ? "lendo" : progresso > 0 ? "pausada" : "pronta"}</p>
              </div>
            </div>
            <ol className="mt-6 space-y-3">
              {ETAPAS_VARREDURA.map((e, i) => {
                const ok = progresso >= e.ate;
                const atual = i === etapaAtual && !feita;
                return (
                  <li key={e.nome} className={cn("flex gap-3 text-sm", !ok && !atual && "opacity-50")}>
                    <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/30 text-[11px] font-bold", ok && "border-verde bg-verde text-fundo", atual && "border-menta text-menta")}>
                      {ok ? <Check className="size-3.5" /> : atual && rodando ? <LoaderCircle className="size-3.5 animate-spin" /> : i + 1}
                    </span>
                    <span><b className="block font-semibold">{e.nome}</b><span className="text-xs text-white/70">{e.texto}</span></span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <div className="space-y-5">
          <section className="glass overflow-hidden rounded-[1.75rem]" aria-label="Arquivos encontrados">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5 pb-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><Radar className="size-5 text-petroleo" /> Arquivos encontrados</h2>
              <Chip tom="verde">{achados.length} de {ARQUIVOS.length}</Chip>
            </div>
            <div className="relative">
              {rodando && <span className="linha-varre" />}
              {achados.length === 0 ? (
                <div className="space-y-2 px-5 pb-5">
                  {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-2xl bg-white/60" />)}
                  <p className="pt-1 text-center text-xs text-muted-foreground">{rodando ? "Copiando a pasta do aplicativo. Os primeiros arquivos aparecem em instantes." : "Inicie a varredura pra listar os arquivos."}</p>
                </div>
              ) : (
                <ul className="scroll-thin max-h-[26rem] divide-y divide-tinta/8 overflow-y-auto">
                  {achados.map((a) => {
                    const Icone = ICONE_ORIGEM[a.origem];
                    const melhor = a.id === "a3";
                    return (
                      <li key={a.id} className={cn("animate-pop flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3", melhor && "bg-verde/10")}>
                        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", melhor ? "bg-verde text-white" : "bg-petroleo/10 text-petroleo")}><Icone className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[13px] font-semibold">{a.nome}</p>
                          <p className="text-xs text-muted-foreground">{a.nota}</p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="tabular font-semibold">{a.tamanho}</p>
                          <p className="text-muted-foreground">{fmtData(a.data, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-44 sm:flex-col sm:items-end">
                          <EstadoChip estado={a.estado} />
                          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Hash className="size-3" />{a.sha}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="glass-noite rounded-[1.75rem] p-5" aria-label="Registro da varredura">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Terminal className="size-4 text-menta" /> Registro, pra você conferir cada passo</h2>
            <div ref={caixaLog} className="scroll-thin h-40 overflow-y-auto rounded-2xl bg-fundo/70 p-4 font-mono text-xs leading-relaxed text-menta/95">
              {linhas.length === 0 && <p className="text-white/50">aguardando início...</p>}
              {linhas.map((l) => <p key={l.t}><span className="text-white/40">{String(l.em).padStart(3, "0")}</span> {l.t}</p>)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
