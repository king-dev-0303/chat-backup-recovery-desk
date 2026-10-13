"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock3, ListChecks, Lock, Radar, ShieldCheck, Stethoscope, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Chance, Chip, Topo, Vazio, btnGlass, btnPrimario, btnVerde } from "@/components/bits";
import { cn } from "@/lib/utils";
import { CONGELAR, OCORRIDOS } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function PlanoPage() {
  const { diag, diagFeito, rotas, rota, escolherRota, congelado, alternarCongelar, setVarredura, varredura } = useStore();
  const router = useRouter();
  const pronto = congelado.length === CONGELAR.length;

  if (!diagFeito) {
    return (
      <Vazio icone={Stethoscope} titulo="O plano nasce do diagnóstico" texto="Responda as quatro perguntas e os caminhos de recuperação aparecem aqui, do mais provável ao menos provável.">
        <Link href="/diagnostico" className={cn(buttonVariants(), btnPrimario, "mt-2")}>Fazer o diagnóstico <ArrowRight className="size-4" /></Link>
      </Vazio>
    );
  }

  const iniciar = () => {
    if (!pronto) return toast.error("Faltam itens da lista de preservação", { description: "A varredura só começa com o original protegido." });
    if (varredura !== "concluida") setVarredura("rodando", 0);
    router.push("/varredura");
  };

  return (
    <div>
      <Topo passo="Etapa 2 de 5" titulo="Plano de recuperação" texto={`${diag.modelo} - ${OCORRIDOS[diag.ocorrido].nome.toLowerCase()}. Os caminhos estão em ordem de chance, com o motivo de cada número.`}>
        <Link href="/diagnostico" className={cn(buttonVariants({ variant: "outline" }), btnGlass)}><Stethoscope className="size-4" /> Rever respostas</Link>
      </Topo>

      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <section aria-label="Caminhos de recuperação" className="space-y-4">
          {rotas.map((r, i) => {
            const ativa = r.id === rota.id;
            return (
              <article key={r.id} className={cn("glass overflow-hidden rounded-[1.75rem] transition", ativa && "ring-2 ring-petroleo")}>
                <div className="grid sm:grid-cols-[13rem_1fr]">
                  <div className="relative h-40 sm:h-full">
                    <img src={r.img} alt="" className="absolute inset-0 size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-fundo/75 via-fundo/20 to-transparent sm:bg-gradient-to-r" />
                    <Chip tom="foto" className="absolute top-3 left-3">{i === 0 ? "Começar por aqui" : `${i + 1}ª opção`}</Chip>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold">{r.nome}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{r.resumo}</p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-petroleo"><Clock3 className="size-3.5" /> {r.prazo}</p>
                      </div>
                      <Chance valor={r.chance} />
                    </div>
                    <p className="mt-3 rounded-xl bg-petroleo/8 p-3 text-xs leading-relaxed"><b>Por que {r.chance}%:</b> {r.motivo}</p>
                    {ativa ? (
                      <div className="animate-pop mt-4">
                        <ol className="space-y-2">
                          {r.passos.map((p, k) => (
                            <li key={p} className="flex gap-2.5 text-sm">
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-petroleo text-[10px] font-bold text-white">{k + 1}</span>{p}
                            </li>
                          ))}
                        </ol>
                        <p className="mt-3 flex gap-2 rounded-xl border border-ambar/40 bg-ambar/14 p-3 text-xs font-medium text-[#7a4a05]"><TriangleAlert className="mt-0.5 size-4 shrink-0" /> {r.risco}</p>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => escolherRota(r.id)} className={cn(btnGlass, "mt-4 h-10")}>Ver passos e risco</Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="glass-noite h-fit rounded-[1.75rem] p-5 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ListChecks className="size-5 text-menta" /> Preservar antes de testar</h2>
          <p className="mt-1 text-xs text-white/75">Cada item fecha uma forma de perder o que ainda existe. A varredura libera com os cinco marcados.</p>
          <ul className="mt-4 space-y-2">
            {CONGELAR.map((c) => {
              const ok = congelado.includes(c.id);
              return (
                <li key={c.id}>
                  <button type="button" role="checkbox" aria-checked={ok} onClick={() => alternarCongelar(c.id)}
                    className={cn("flex w-full gap-3 rounded-2xl border border-white/15 bg-white/8 p-3 text-left transition hover:bg-white/16 focus-visible:ring-3 focus-visible:ring-menta focus-visible:outline-none", ok && "border-verde/50 bg-verde/18")}>
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-white/45", ok && "border-verde bg-verde text-fundo")}>{ok && <Check className="size-3.5" />}</span>
                    <span>
                      <span className="block text-sm font-semibold">{c.titulo}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-white/75">{c.texto}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><span className="block h-full rounded-full bg-verde transition-all duration-500" style={{ width: `${(congelado.length / CONGELAR.length) * 100}%` }} /></div>
          <Button onClick={iniciar} aria-disabled={!pronto} className={cn(btnVerde, "sheen relative mt-4 h-12 w-full text-base", !pronto && "opacity-60")}>
            {pronto ? <Radar className="size-5" /> : <Lock className="size-4" />}
            {varredura === "concluida" ? "Ver a varredura" : pronto ? "Iniciar a varredura" : `Faltam ${CONGELAR.length - congelado.length} itens`}
          </Button>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-white/70"><ShieldCheck className="size-4 shrink-0 text-menta" /> A varredura só lê. Nada é gravado no aparelho nem na conta.</p>
        </aside>
      </div>
    </div>
  );
}
