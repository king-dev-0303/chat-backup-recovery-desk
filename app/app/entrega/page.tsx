"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CircleCheck, Copy, FileArchive, FileDown, FileText, Fingerprint, Images, LoaderCircle, MessagesSquare, Mic, Radar, Smartphone, Trash2, TriangleAlert, Video } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip, Topo, Vazio, btnGlass, btnPrimario, btnVerde, dlg } from "@/components/bits";
import { cn } from "@/lib/utils";
import { CASO, COBERTURA, CONVERSAS, FORMATOS, RESUMO, fmtData, fmtN } from "@/lib/data";
import { useStore } from "@/lib/store";

const ICONE_FORMATO = { aparelho: Smartphone, html: MessagesSquare, pdf: FileText, zip: FileArchive };
const HASH = "c2e85f90a7d1 4be0 91f3 0d2a 7c55e1a9b6f4";
const MAX = Math.max(...COBERTURA.map((c) => c.n));

export default function EntregaPage() {
  const { pronto, varredura, marcadas, formato, setFormato, entregue, entregar, apagarCaso } = useStore();
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const [apagar, setApagar] = useState(false);
  const [confirma, setConfirma] = useState("");

  if (pronto && varredura !== "concluida") {
    return (
      <Vazio icone={Radar} titulo="A entrega vem depois da varredura" texto="O relatório mostra o que foi aberto, o que ficou de fora e em qual formato você quer receber.">
        <Link href="/varredura" className={cn(buttonVariants(), btnPrimario, "mt-2")}>Ir pra varredura <ArrowRight className="size-4" /></Link>
      </Vazio>
    );
  }

  const escolhidas = CONVERSAS.filter((c) => marcadas.includes(c.id));
  const msgs = escolhidas.reduce((s, c) => s + c.mensagens, 0);
  const f = FORMATOS.find((x) => x.id === formato)!;

  const gerar = () => {
    if (escolhidas.length === 0) return toast.error("Nenhuma conversa marcada", { description: "Marque ao menos uma conversa na etapa anterior." });
    setGerando(true);
    setTimeout(() => {
      setGerando(false);
      entregar();
      toast.success(formato === "aparelho" ? "Restauração agendada" : "Pacote de entrega pronto", { description: `${escolhidas.length} conversas, ${fmtN(msgs)} mensagens - ${f.nome.toLowerCase()}.` });
    }, 1600);
  };

  const numeros = [
    { icone: MessagesSquare, n: fmtN(RESUMO.mensagens), t: `mensagens em ${RESUMO.conversas} conversas` },
    { icone: Images, n: fmtN(RESUMO.fotos), t: "fotos" },
    { icone: Mic, n: fmtN(RESUMO.audios), t: "áudios" },
    { icone: Video, n: fmtN(RESUMO.videos - RESUMO.videosCortados), t: `vídeos inteiros, de ${RESUMO.videos}` },
  ];

  return (
    <div>
      <Topo passo="Etapa 5 de 5" titulo="Relatório e entrega" texto="O que voltou, o que não voltou e por quê. Você escolhe o formato, confere o hash e decide quando os dados do caso são apagados.">
        {entregue && <Chip tom="verde" className="px-3 py-2 text-xs"><CircleCheck className="size-4" /> Entrega registrada</Chip>}
      </Topo>

      <section className="glass-noite relative mb-5 overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
        <img src="/img/familia.jpg" alt="" className="animate-kenburns absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-r from-fundo/90 via-fundo/65 to-fundo/30" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-menta uppercase">Caso {CASO.id} - {CASO.negocio}</p>
            <p className="font-heading mt-2 text-4xl font-bold sm:text-5xl">Histórico de volta até <span className="text-grad">3 de outubro</span></p>
            <p className="mt-3 max-w-md text-sm text-white/80">Aberto da cópia local msgstore-2026-10-03, a última feita antes da troca de aparelho.</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {numeros.map((s) => (
              <div key={s.t} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <s.icone className="mb-2 size-5 text-menta" />
                <dt className="font-heading tabular text-2xl font-semibold">{s.n}</dt>
                <dd className="mt-0.5 text-[11px] leading-tight text-white/75">{s.t}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-5">
          <section className="glass rounded-[1.75rem] p-5 sm:p-6" aria-labelledby="t-cob">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="t-cob" className="text-lg font-semibold">Cobertura de 2026, mês a mês</h2>
              <div className="flex gap-2"><Chip tom="verde">completo</Chip><Chip tom="ambar"><TriangleAlert className="size-3" /> com lacuna</Chip></div>
            </div>
            <div className="mt-5 flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label="Mensagens recuperadas por mês em 2026, com lacunas em junho e outubro">
              {COBERTURA.map((c, i) => (
                <div key={c.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="tabular text-[10px] font-semibold text-muted-foreground">{(c.n / 1000).toFixed(1).replace(".", ",")}k</span>
                  <span className={cn("animate-rise w-full rounded-t-xl rounded-b-md", c.ok ? "bg-gradient-to-t from-petroleo to-verde" : "fluxo bg-ambar")} style={{ height: `${(c.n / MAX) * 78}%`, animationDelay: `${i * 50}ms` }} />
                  <span className="text-[11px] font-semibold">{c.mes}</span>
                </div>
              ))}
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              <li className="flex gap-2.5 rounded-2xl border border-ambar/40 bg-ambar/14 p-3 text-xs text-[#7a4a05]"><TriangleAlert className="mt-0.5 size-4 shrink-0" /><span><b>4 a 7 de junho:</b> o aparelho ficou sem espaço e o aplicativo não gravou nesses dias. Não existe em nenhuma fonte.</span></li>
              <li className="flex gap-2.5 rounded-2xl border border-ambar/40 bg-ambar/14 p-3 text-xs text-[#7a4a05]"><TriangleAlert className="mt-0.5 size-4 shrink-0" /><span><b>3 a 9 de outubro:</b> {RESUMO.perdidos} dias depois da última cópia boa. Só voltam se o outro lado da conversa reenviar.</span></li>
            </ul>
          </section>

          <section className="glass rounded-[1.75rem] p-5 sm:p-6" aria-labelledby="t-fmt">
            <h2 id="t-fmt" className="text-lg font-semibold">Como você quer receber</h2>
            <div role="radiogroup" aria-labelledby="t-fmt" className="mt-4 grid gap-3 sm:grid-cols-2">
              {FORMATOS.map((x) => {
                const Icone = ICONE_FORMATO[x.id];
                const ativo = formato === x.id;
                return (
                  <button key={x.id} type="button" role="radio" aria-checked={ativo} onClick={() => setFormato(x.id)}
                    className={cn("glass-soft relative flex gap-3 rounded-2xl p-4 text-left transition hover:bg-white/70 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none", ativo && "bg-white/85 ring-2 ring-petroleo")}>
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", ativo ? "bg-petroleo text-white" : "bg-petroleo/12 text-petroleo")}><Icone className="size-5" /></span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">{x.nome}{"recomendado" in x && <Chip tom="verde" className="px-2 py-0.5 text-[10px]">recomendado</Chip>}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{x.texto}</span>
                    </span>
                    {ativo && <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-petroleo text-white"><Check className="size-3" /></span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <section className="glass rounded-[1.75rem] p-5" aria-label="Resumo da entrega">
            <h2 className="text-lg font-semibold">Sua entrega</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Conversas marcadas</dt><dd className="tabular font-semibold">{escolhidas.length} de {CONVERSAS.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Mensagens</dt><dd className="tabular font-semibold">{fmtN(msgs)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Formato</dt><dd className="text-right font-semibold">{f.nome}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Cópia de origem</dt><dd className="font-semibold">{fmtData(RESUMO.ate)}</dd></div>
            </dl>
            <div className="mt-4 rounded-2xl bg-petroleo/8 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-petroleo"><Fingerprint className="size-4" /> SHA-256 da cópia aberta</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate font-mono text-[11px]">{HASH}</code>
                <Button variant="ghost" size="icon" aria-label="Copiar hash" onClick={() => { navigator.clipboard?.writeText(HASH); toast.success("Hash copiado"); }} className="size-8 rounded-lg hover:bg-white/70"><Copy className="size-4" /></Button>
              </div>
            </div>
            <Button onClick={gerar} disabled={gerando} className={cn(btnVerde, "sheen relative mt-4 h-12 w-full text-base")}>
              {gerando ? <><LoaderCircle className="size-5 animate-spin" /> Preparando</> : entregue ? <><FileDown className="size-5" /> Gerar de novo</> : <><FileDown className="size-5" /> {formato === "aparelho" ? "Agendar a restauração" : "Gerar o pacote"}</>}
            </Button>
            <Link href="/conversas" className={cn(buttonVariants({ variant: "outline" }), btnGlass, "mt-2 w-full")}>Rever as conversas marcadas</Link>
          </section>

          <section className="glass-soft rounded-[1.75rem] p-5" aria-label="Privacidade">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Trash2 className="size-4 text-risco" /> Apagar os dados do caso</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">Depois da entrega, as cópias de trabalho saem do disco. Você pode pedir isso a qualquer momento.</p>
            <Button variant="outline" onClick={() => { setConfirma(""); setApagar(true); }} className={cn(btnGlass, "mt-3 h-10 w-full border-risco/30 text-risco hover:bg-risco/10 hover:text-risco")}>Apagar tudo deste caso</Button>
          </section>
        </aside>
      </div>

      <Dialog open={apagar} onOpenChange={setApagar}>
        <DialogContent className={cn(dlg, "sm:max-w-md")}>
          <DialogHeader><DialogTitle className="text-xl">Apagar os dados do caso {CASO.id}?</DialogTitle><DialogDescription>As cópias de trabalho, as conversas abertas e o relatório são removidos e não voltam. O aparelho e a sua conta não são alterados.</DialogDescription></DialogHeader>
          <div>
            <Label htmlFor="confirma" className="mb-1.5">Digite {CASO.id} pra confirmar</Label>
            <Input id="confirma" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder={CASO.id} autoComplete="off" className="field" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApagar(false)} className={btnGlass}>Manter</Button>
            <Button disabled={confirma.trim().toUpperCase() !== CASO.id} onClick={() => { apagarCaso(); setApagar(false); toast.success("Dados do caso apagados"); router.push("/"); }} className="h-11 rounded-2xl bg-risco px-5 text-sm font-semibold text-white hover:bg-risco/90">
              <Trash2 className="size-4" /> Apagar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
