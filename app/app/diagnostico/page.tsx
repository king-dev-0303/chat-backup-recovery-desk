"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleHelp, HardDrive, KeyRound, Laptop, LoaderCircle, Smartphone } from "lucide-react";
import { SiAndroid, SiApple, SiGoogledrive, SiIcloud } from "react-icons/si";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Chance, Chip, Topo, btnGlass, btnPrimario } from "@/components/bits";
import { cn } from "@/lib/utils";
import { FONTES, OCORRIDOS, calcularRotas, type Cripto, type Diagnostico, type Fonte, type Ocorrido } from "@/lib/data";
import { useStore } from "@/lib/store";

const PASSOS = ["Aparelho", "O que aconteceu", "Onde havia backup", "Detalhes"];
const ICONE_FONTE = { drive: SiGoogledrive, icloud: SiIcloud, local: HardDrive, computador: Laptop };
const FOTO_SO = { android: "/img/galaxy.jpg", ios: "/img/iphone.jpg" };

function Opcao({ ativo, onClick, children, className }: { ativo: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" role="radio" aria-checked={ativo} onClick={onClick}
      className={cn("glass-soft relative rounded-2xl p-4 text-left transition hover:bg-white/70 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none", ativo && "bg-white/85 ring-2 ring-petroleo", className)}>
      {ativo && <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-petroleo text-white"><Check className="size-3" /></span>}
      {children}
    </button>
  );
}

export default function DiagnosticoPage() {
  const { diag, salvarDiag } = useStore();
  const router = useRouter();
  const [d, setD] = useState<Diagnostico>(diag);
  const [passo, setPasso] = useState(0);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const set = (p: Partial<Diagnostico>) => { setD((a) => ({ ...a, ...p })); setErros({}); };
  const previa = calcularRotas(d);
  const fontesDoSo = (Object.keys(FONTES) as Fonte[]).filter((f) => FONTES[f].so === "ambos" || FONTES[f].so === d.sistema);

  const validar = () => {
    const e: Record<string, string> = {};
    if (passo === 0 && d.modelo.trim().length < 3) e.modelo = "Informe o modelo, por exemplo Galaxy A54 ou iPhone 13.";
    if (passo === 3) {
      if (!d.ultimoBackup) e.ultimoBackup = "Informe uma data aproximada. Vale a última em que as conversas estavam lá.";
      else if (d.ultimoBackup > "2026-10-13") e.ultimoBackup = "A data não pode estar no futuro.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.conta)) e.conta = "Informe o e-mail da conta Google ou Apple usada no aparelho.";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const avancar = () => {
    if (!validar()) return;
    if (passo < 3) return setPasso(passo + 1);
    setSalvando(true);
    setTimeout(() => {
      salvarDiag({ ...d, fontes: d.fontes.filter((f) => fontesDoSo.includes(f)) });
      toast.success("Diagnóstico salvo", { description: `Melhor caminho: ${previa[0].nome} (${previa[0].chance}%).` });
      router.push("/plano");
    }, 900);
  };

  return (
    <div>
      <Topo passo="Etapa 1 de 5" titulo="Diagnóstico da perda" texto="Quatro perguntas curtas. As respostas decidem onde procurar primeiro e o que precisa ser preservado antes de qualquer teste." />

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="glass rounded-[1.75rem] p-5 sm:p-7">
          <ol className="mb-7 flex gap-2" aria-label="Progresso do diagnóstico">
            {PASSOS.map((p, i) => (
              <li key={p} className="flex-1">
                <button type="button" onClick={() => i < passo && setPasso(i)} disabled={i > passo} aria-current={i === passo ? "step" : undefined} className="w-full text-left disabled:cursor-not-allowed">
                  <span className={cn("block h-1.5 rounded-full transition-colors", i < passo ? "bg-verde" : i === passo ? "bg-petroleo" : "bg-tinta/12")} />
                  <span className={cn("mt-2 hidden text-xs font-semibold sm:block", i === passo ? "text-petroleo" : "text-muted-foreground")}>{i + 1}. {p}</span>
                </button>
              </li>
            ))}
          </ol>

          <div key={passo} className="animate-pop">
            {passo === 0 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="mb-3 text-lg font-semibold">Em qual sistema as conversas estavam?</legend>
                  <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                    {(["android", "ios"] as const).map((s) => (
                      <Opcao key={s} ativo={d.sistema === s} onClick={() => set({ sistema: s, modelo: s === d.sistema ? d.modelo : "" })} className="overflow-hidden p-2">
                        <img src={FOTO_SO[s]} alt="" className="h-32 w-full rounded-xl object-cover" />
                        <span className="flex items-center gap-2 px-2 pt-3 pb-1 font-semibold">
                          {s === "android" ? <SiAndroid className="size-5 text-petroleo" /> : <SiApple className="size-5 text-petroleo" />}
                          {s === "android" ? "Android" : "iPhone"}
                        </span>
                      </Opcao>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <Label htmlFor="modelo" className="mb-1.5">Modelo do aparelho</Label>
                  <Input id="modelo" value={d.modelo} onChange={(e) => set({ modelo: e.target.value })} placeholder={d.sistema === "android" ? "Ex.: Samsung Galaxy A54" : "Ex.: iPhone 13"} aria-invalid={!!erros.modelo} aria-describedby="e-modelo" className="field" />
                  {erros.modelo && <p id="e-modelo" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{erros.modelo}</p>}
                </div>
                <label className="glass-soft flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4">
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="size-4 text-petroleo" /> O aparelho antigo ainda está com você</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">Mesmo com a tela quebrada. Ele costuma ser a melhor fonte.</span>
                  </span>
                  <Switch checked={d.temAparelho} onCheckedChange={(v) => set({ temAparelho: v })} aria-label="O aparelho antigo ainda está com você" />
                </label>
              </div>
            )}

            {passo === 1 && (
              <fieldset>
                <legend className="mb-3 text-lg font-semibold">O que aconteceu com as conversas?</legend>
                <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(OCORRIDOS) as Ocorrido[]).map((o) => (
                    <Opcao key={o} ativo={d.ocorrido === o} onClick={() => set({ ocorrido: o })}>
                      <span className="block pr-7 text-sm font-semibold">{OCORRIDOS[o].nome}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{OCORRIDOS[o].texto}</span>
                    </Opcao>
                  ))}
                </div>
              </fieldset>
            )}

            {passo === 2 && (
              <fieldset>
                <legend className="text-lg font-semibold">Onde você acha que havia backup?</legend>
                <p className="mt-1 mb-3 text-sm text-muted-foreground">Marque todos que se aplicam. Se não souber, deixe em branco: eu confiro os três.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {fontesDoSo.map((f) => {
                    const Icone = ICONE_FONTE[f];
                    const ativo = d.fontes.includes(f);
                    return (
                      <button key={f} type="button" role="checkbox" aria-checked={ativo} onClick={() => set({ fontes: ativo ? d.fontes.filter((x) => x !== f) : [...d.fontes, f] })}
                        className={cn("glass-soft relative rounded-2xl p-4 text-left transition hover:bg-white/70 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none", ativo && "bg-white/85 ring-2 ring-petroleo")}>
                        <span className={cn("mb-3 flex size-11 items-center justify-center rounded-xl", ativo ? "bg-petroleo text-white" : "bg-petroleo/12 text-petroleo")}><Icone className="size-5" /></span>
                        <span className="block text-sm font-semibold">{FONTES[f].nome}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{FONTES[f].texto}</span>
                        {ativo && <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-petroleo text-white"><Check className="size-3" /></span>}
                      </button>
                    );
                  })}
                </div>
                {d.fontes.filter((f) => fontesDoSo.includes(f)).length === 0 && (
                  <p className="mt-4 flex items-center gap-2 rounded-2xl border border-ceu/25 bg-ceu/10 p-3 text-xs font-medium text-[#1d5f93]"><CircleHelp className="size-4 shrink-0" /> Sem problema. A varredura começa pelo aparelho e depois confere a conta na nuvem.</p>
                )}
              </fieldset>
            )}

            {passo === 3 && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ultimo" className="mb-1.5">Última data em que as conversas estavam lá</Label>
                    <Input id="ultimo" type="date" max="2026-10-13" value={d.ultimoBackup} onChange={(e) => set({ ultimoBackup: e.target.value })} aria-invalid={!!erros.ultimoBackup} aria-describedby="e-ultimo" className="field" />
                    {erros.ultimoBackup && <p id="e-ultimo" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{erros.ultimoBackup}</p>}
                  </div>
                  <div>
                    <Label htmlFor="conta" className="mb-1.5">Conta {d.sistema === "android" ? "Google" : "Apple"} do aparelho</Label>
                    <Input id="conta" type="email" value={d.conta} onChange={(e) => set({ conta: e.target.value })} placeholder="voce@exemplo.com" aria-invalid={!!erros.conta} aria-describedby="e-conta" className="field" />
                    {erros.conta && <p id="e-conta" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{erros.conta}</p>}
                  </div>
                </div>
                <label className="glass-soft flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4">
                  <span>
                    <span className="block text-sm font-semibold">O número de telefone continua o mesmo</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">O backup só abre com o número que o criou.</span>
                  </span>
                  <Switch checked={d.mesmoNumero} onCheckedChange={(v) => set({ mesmoNumero: v })} aria-label="O número de telefone continua o mesmo" />
                </label>
                <fieldset>
                  <legend className="mb-2 flex items-center gap-2 text-sm font-semibold"><KeyRound className="size-4 text-petroleo" /> O backup era protegido por senha (criptografia de ponta a ponta)?</legend>
                  <div role="radiogroup" className="grid grid-cols-3 gap-2">
                    {([["sim", "Sim"], ["nao", "Não"], ["naosei", "Não sei"]] as [Cripto, string][]).map(([v, n]) => (
                      <button key={v} type="button" role="radio" aria-checked={d.cripto === v} onClick={() => set({ cripto: v })}
                        className={cn("glass-soft h-11 rounded-xl text-sm font-semibold transition hover:bg-white/70 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none", d.cripto === v && "bg-petroleo text-white hover:bg-petroleo")}>{n}</button>
                    ))}
                  </div>
                </fieldset>
                {d.cripto === "sim" && (
                  <label className="glass-soft animate-pop flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4">
                    <span>
                      <span className="block text-sm font-semibold">Tenho a senha ou a chave de 64 dígitos</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">Sem uma das duas, esse backup não abre. Não existe atalho.</span>
                    </span>
                    <Switch checked={d.temChave} onCheckedChange={(v) => set({ temChave: v })} aria-label="Tenho a senha ou a chave de 64 dígitos" />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setPasso(passo - 1)} disabled={passo === 0 || salvando} className={btnGlass}><ArrowLeft className="size-4" /> Voltar</Button>
            <Button type="button" onClick={avancar} disabled={salvando} className={btnPrimario}>
              {salvando ? <><LoaderCircle className="size-4 animate-spin" /> Montando o plano</> : passo === 3 ? <>Ver o plano <ArrowRight className="size-4" /></> : <>Continuar <ArrowRight className="size-4" /></>}
            </Button>
          </div>
        </section>

        <aside className="glass-noite h-fit overflow-hidden rounded-[1.75rem] lg:sticky lg:top-24" aria-live="polite">
          <div className="relative h-28">
            <img src={previa[0].img} alt="" className="size-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-fundo to-transparent" />
            <Chip tom="claro" className="absolute top-3 left-3">prévia ao vivo</Chip>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">Com as respostas até aqui</p>
            <div className="mt-3 flex items-center gap-4">
              <Chance valor={previa[0].chance} escuro />
              <p className="text-sm leading-snug font-semibold">{previa[0].nome}</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/80">{previa[0].motivo}</p>
            <ul className="mt-4 space-y-2 border-t border-white/15 pt-4">
              {previa.slice(1).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-xs text-white/85">
                  <span>{r.nome}</span><b className="tabular">{r.chance}%</b>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
