"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCheck, FileDown, FileText, Images, MessagesSquare, Mic, Pause, Play, Radar, Search, SearchX, SquareCheckBig, TriangleAlert, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, Chip, Topo, Vazio, btnGlass, btnPrimario, btnVerde, dlg, tabCls, tabList } from "@/components/bits";
import { cn } from "@/lib/utils";
import { CONVERSAS, ETIQUETAS, MIDIAS, fmtData, fmtDur, fmtN, type Conversa, type Mensagem, type Midia, type TipoMidia } from "@/lib/data";
import { useStore } from "@/lib/store";

const FILTROS = [["todas", "Todas"], ["cliente", "Clientes"], ["familia", "Família"], ["parcial", "Com lacuna"]] as const;
const TIPOS: { id: TipoMidia | "todas"; nome: string; icone: typeof Images }[] = [
  { id: "todas", nome: "Tudo", icone: Images }, { id: "foto", nome: "Fotos", icone: Images }, { id: "video", nome: "Vídeos", icone: Video },
  { id: "audio", nome: "Áudios", icone: Mic }, { id: "doc", nome: "Documentos", icone: FileText },
];
const BARRAS = [5, 9, 14, 8, 12, 16, 7, 11, 15, 9, 6, 13, 10, 16, 8, 12, 5, 9, 14, 7, 11, 6];

function Audio({ id, dur, tocando, alternar }: { id: string; dur: number; tocando: string | null; alternar: (id: string) => void }) {
  const on = tocando === id;
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => alternar(id)} aria-label={on ? "Pausar áudio" : "Ouvir áudio recuperado"} aria-pressed={on}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-petroleo text-white transition hover:brightness-110 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none">
        {on ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
      </button>
      <span className={cn("onda flex h-6 items-center gap-[3px] text-petroleo/70", on && "tocando text-petroleo")} aria-hidden>
        {BARRAS.map((h, i) => <span key={i} style={{ height: h + 4, animationDelay: `${i * 60}ms` }} />)}
      </span>
      <span className="tabular text-xs text-muted-foreground">{fmtDur(dur)}</span>
    </div>
  );
}

function Balao({ m, grupo, tocando, alternar, abrir }: { m: Mensagem; grupo?: boolean; tocando: string | null; alternar: (id: string) => void; abrir: (src: string) => void }) {
  const eu = m.de === "eu";
  return (
    <div className={cn("flex", eu ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm", eu ? "balao-eu rounded-tr-md" : "balao-outro rounded-tl-md")}>
        {grupo && !eu && m.autor && <p className="mb-0.5 text-xs font-bold text-petroleo">{m.autor}</p>}
        {m.img && (
          <button type="button" onClick={() => abrir(m.img!)} className="mb-1 block overflow-hidden rounded-xl focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none" aria-label="Ampliar foto recuperada">
            <img src={m.img} alt="Foto recuperada da conversa" className="max-h-56 w-64 object-cover transition hover:scale-105" />
          </button>
        )}
        {m.audio && <Audio id={m.id} dur={m.audio} tocando={tocando} alternar={alternar} />}
        {m.doc && (
          <button type="button" onClick={() => toast.success("Documento aberto na cópia de trabalho", { description: m.doc })} className="flex items-center gap-2.5 rounded-xl bg-tinta/6 p-2.5 text-left transition hover:bg-tinta/10">
            <span className="flex size-9 items-center justify-center rounded-lg bg-risco/14 text-risco"><FileText className="size-4" /></span>
            <span className="text-xs font-semibold">{m.doc}</span>
          </button>
        )}
        {m.texto && <p className="leading-snug">{m.texto}</p>}
        <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-tinta/50">{m.hora}{eu && <CheckCheck className="size-3.5 text-ceu" />}</p>
      </div>
    </div>
  );
}

export default function ConversasPage() {
  const { pronto, varredura, marcadas, alternarMarcada, marcarTodas } = useStore();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number][0]>("todas");
  const [abertaId, setAbertaId] = useState<string | null>("c1");
  const [tipo, setTipo] = useState<TipoMidia | "todas">("todas");
  const [tocando, setTocando] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [midia, setMidia] = useState<Midia | null>(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return CONVERSAS.filter((c) => (filtro === "todas" ? true : filtro === "parcial" ? c.estado === "parcial" : c.etiqueta === filtro))
      .filter((c) => !q || c.nome.toLowerCase().includes(q) || c.msgs.some((m) => m.texto?.toLowerCase().includes(q)));
  }, [busca, filtro]);
  const midias = MIDIAS.filter((m) => tipo === "todas" || m.tipo === tipo);
  const aberta: Conversa | undefined = lista.find((c) => c.id === abertaId);
  const alternarAudio = (id: string) => setTocando((a) => (a === id ? null : id));
  const nomeDe = (id: string) => CONVERSAS.find((c) => c.id === id)?.nome ?? "";

  if (pronto && varredura !== "concluida") {
    return (
      <Vazio icone={Radar} titulo="Ainda não há conversas abertas" texto="As conversas aparecem aqui quando a varredura termina e a melhor cópia é restaurada no aparelho de teste.">
        <Link href="/varredura" className={cn(buttonVariants(), btnPrimario, "mt-2")}>Ir pra varredura <ArrowRight className="size-4" /></Link>
      </Vazio>
    );
  }

  return (
    <div>
      <Topo passo="Etapa 4 de 5" titulo="Conversas recuperadas" texto="Confira antes de receber. Tudo aqui foi lido da cópia de 3 de outubro, e o que veio incompleto está marcado.">
        <Link href="/entrega" className={cn(buttonVariants(), btnVerde, "sheen relative")}><FileDown className="size-4" /> Entregar {marcadas.length} conversas <ArrowRight className="size-4" /></Link>
      </Topo>

      <Tabs defaultValue="conversas" className="gap-5">
        <TabsList className={tabList}>
          <TabsTrigger value="conversas" className={tabCls}><MessagesSquare className="size-4" /> Conversas ({CONVERSAS.length} de 61)</TabsTrigger>
          <TabsTrigger value="midias" className={tabCls}><Images className="size-4" /> Mídias ({fmtN(3481)})</TabsTrigger>
        </TabsList>

        <TabsContent value="conversas">
          <div className="grid gap-5 lg:grid-cols-[23rem_1fr]">
            <section className={cn("glass flex-col overflow-hidden rounded-[1.75rem] lg:flex", abertaId ? "hidden" : "flex")} aria-label="Lista de conversas">
              <div className="space-y-3 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input aria-label="Buscar nas conversas recuperadas" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome ou mensagem..." className="field h-11 rounded-full pl-10" />
                </div>
                <div className="sem-barra flex gap-1.5 overflow-x-auto" role="radiogroup" aria-label="Filtrar conversas">
                  {FILTROS.map(([id, nome]) => (
                    <button key={id} type="button" role="radio" aria-checked={filtro === id} onClick={() => setFiltro(id)}
                      className={cn("h-8 shrink-0 rounded-full border border-white/80 bg-white/55 px-3 text-xs font-semibold text-tinta/70 transition hover:bg-white/90", filtro === id && "border-petroleo bg-petroleo text-white hover:bg-petroleo")}>{nome}</button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{marcadas.length} marcadas pra entrega</span>
                  <button type="button" onClick={() => marcarTodas(marcadas.length === CONVERSAS.length ? [] : CONVERSAS.map((c) => c.id))} className="flex items-center gap-1 font-semibold text-petroleo hover:underline">
                    <SquareCheckBig className="size-3.5" /> {marcadas.length === CONVERSAS.length ? "Desmarcar todas" : "Marcar todas"}
                  </button>
                </div>
              </div>
              {lista.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <SearchX className="size-7 text-muted-foreground" />
                  <p className="text-sm font-semibold">Nada encontrado</p>
                  <p className="text-xs text-muted-foreground">Tente outro nome ou limpe o filtro.</p>
                  <Button variant="outline" onClick={() => { setBusca(""); setFiltro("todas"); }} className={cn(btnGlass, "mt-1 h-9")}>Limpar busca</Button>
                </div>
              ) : (
                <ul className="scroll-thin max-h-[34rem] flex-1 overflow-y-auto px-2 pb-2">
                  {lista.map((c) => {
                    const sel = marcadas.includes(c.id);
                    return (
                      <li key={c.id} className={cn("rowlink flex items-center gap-1 rounded-2xl pr-2", abertaId === c.id && "bg-white/75 shadow-sm")}>
                        <button type="button" onClick={() => setAbertaId(c.id)} aria-current={abertaId === c.id} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-2.5 text-left focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none">
                          <span className="relative">
                            <Avatar nome={c.nome} src={c.avatar} className="size-12" />
                            {c.grupo && <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-petroleo text-white ring-2 ring-white"><Users className="size-3" /></span>}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold">{c.nome}</span>
                              <span className="tabular shrink-0 text-[10px] text-muted-foreground">{fmtData(c.ate, { day: "2-digit", month: "2-digit" })}</span>
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{c.ultima}</span>
                            <span className="mt-1 flex items-center gap-1.5">
                              <Chip className="px-2 py-0.5 text-[10px]">{fmtN(c.mensagens)} msgs</Chip>
                              {c.estado === "parcial" && <Chip tom="ambar" className="px-2 py-0.5 text-[10px]"><TriangleAlert className="size-2.5" /> lacuna</Chip>}
                            </span>
                          </span>
                        </button>
                        <button type="button" role="checkbox" aria-checked={sel} aria-label={`Incluir ${c.nome} na entrega`} onClick={() => alternarMarcada(c.id)}
                          className={cn("flex size-6 shrink-0 items-center justify-center rounded-md border border-tinta/25 bg-white/70 transition focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none", sel && "border-verde bg-verde text-white")}>
                          {sel && <CheckCheck className="size-3.5" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className={cn("glass flex-col overflow-hidden rounded-[1.75rem] lg:flex", abertaId ? "flex" : "hidden")} aria-label="Conversa aberta">
              {!aberta ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
                  <MessagesSquare className="size-8 text-muted-foreground" />
                  <p className="text-sm font-semibold">Escolha uma conversa na lista</p>
                  <Button variant="outline" onClick={() => setAbertaId(null)} className={cn(btnGlass, "mt-1 h-9 lg:hidden")}><ArrowLeft className="size-4" /> Voltar pra lista</Button>
                </div>
              ) : (
                <>
                  <header className="flex items-center gap-3 border-b border-tinta/8 bg-white/45 px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setAbertaId(null)} aria-label="Voltar pra lista" className="rounded-xl lg:hidden"><ArrowLeft className="size-5" /></Button>
                    <Avatar nome={aberta.nome} src={aberta.avatar} className="size-11" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold">{aberta.nome}</h2>
                      <p className="truncate text-xs text-muted-foreground">{fmtN(aberta.mensagens)} mensagens e {fmtN(aberta.midias)} mídias<span className="hidden sm:inline">, de {fmtData(aberta.de, { month: "short", year: "numeric" })} a {fmtData(aberta.ate)}</span></p>
                    </div>
                    <Chip tom="azul" className="hidden sm:inline-flex">{ETIQUETAS[aberta.etiqueta]}</Chip>
                    {aberta.estado === "completa" ? <Chip tom="verde"><CheckCheck className="size-3" /> Completa</Chip> : <Chip tom="ambar"><TriangleAlert className="size-3" /> Parcial</Chip>}
                  </header>
                  {aberta.lacuna && <p className="flex items-center gap-2 border-b border-ambar/30 bg-ambar/14 px-4 py-2 text-xs font-medium text-[#7a4a05]"><TriangleAlert className="size-4 shrink-0" /> {aberta.lacuna}. Vai descrito no relatório de entrega.</p>}
                  <div key={aberta.id} className="papel-conversa scroll-thin animate-pop max-h-[34rem] min-h-[26rem] flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
                    <p className="mx-auto mb-3 w-fit rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-tinta/70 shadow-sm">{aberta.dia}</p>
                    {aberta.msgs.map((m) => <Balao key={m.id} m={m} grupo={aberta.grupo} tocando={tocando} alternar={alternarAudio} abrir={setFoto} />)}
                    <p className="mx-auto mt-4 w-fit rounded-full bg-petroleo/12 px-3 py-1 text-[11px] font-semibold text-petroleo">fim da cópia de 3 de outubro, 02:00</p>
                  </div>
                </>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="midias">
          <div className="sem-barra mb-4 flex gap-1.5 overflow-x-auto" role="radiogroup" aria-label="Filtrar mídias">
            {TIPOS.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={tipo === t.id} onClick={() => setTipo(t.id)}
                className={cn("flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/80 bg-white/55 px-3.5 text-xs font-semibold text-tinta/70 transition hover:bg-white/90", tipo === t.id && "border-petroleo bg-petroleo text-white hover:bg-petroleo")}>
                <t.icone className="size-3.5" /> {t.nome}
              </button>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {midias.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setMidia(m)} className="glass sheen group relative block w-full overflow-hidden rounded-2xl p-1.5 text-left transition hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none">
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-petroleo/10">
                    {m.src ? <img src={m.src} alt={`Mídia recuperada da conversa com ${nomeDe(m.conversa)}`} className="size-full object-cover transition duration-500 group-hover:scale-110" />
                      : <span className="flex size-full items-center justify-center text-petroleo">{m.tipo === "audio" ? <Mic className="size-9" /> : <FileText className="size-9" />}</span>}
                    {m.tipo === "video" && <span className="absolute inset-0 flex items-center justify-center bg-fundo/25"><span className="chip-foto flex size-10 items-center justify-center rounded-full"><Play className="size-4 translate-x-px" /></span></span>}
                    {!m.ok && <Chip tom="ambar" className="absolute top-2 left-2 bg-ambar text-[#3d2500]"><TriangleAlert className="size-3" /> cortado</Chip>}
                  </span>
                  <span className="block px-1.5 pt-2 pb-1">
                    <span className="block truncate text-xs font-semibold">{m.tipo === "doc" ? m.nome : nomeDe(m.conversa)}</span>
                    <span className="block text-[10px] text-muted-foreground">{fmtData(m.data, { day: "2-digit", month: "short" })} · {m.tamanho}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <Dialog open={!!foto} onOpenChange={(o) => !o && setFoto(null)}>
        <DialogContent className={cn(dlg, "p-3 sm:max-w-2xl")}>
          <DialogHeader className="px-3 pt-2"><DialogTitle className="text-lg">Foto recuperada</DialogTitle><DialogDescription>Lida da pasta de mídias do aparelho, com o arquivo original intacto.</DialogDescription></DialogHeader>
          {foto && <img src={foto} alt="Foto recuperada ampliada" className="max-h-[70dvh] w-full rounded-2xl object-contain" />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!midia} onOpenChange={(o) => !o && setMidia(null)}>
        <DialogContent className={cn(dlg, "sm:max-w-lg")}>
          <DialogHeader><DialogTitle className="text-lg break-all">{midia?.nome}</DialogTitle><DialogDescription>Conversa com {midia && nomeDe(midia.conversa)}, {midia && fmtData(midia.data)}.</DialogDescription></DialogHeader>
          {midia?.src && <img src={midia.src} alt="Mídia recuperada" className="max-h-80 w-full rounded-2xl object-cover" />}
          {midia?.tipo === "audio" && <div className="glass-soft rounded-2xl p-4"><Audio id={midia.id} dur={midia.tamanho === "1:12" ? 72 : midia.tamanho === "0:41" ? 41 : 23} tocando={tocando} alternar={alternarAudio} /></div>}
          <p className={cn("flex items-center gap-2 rounded-xl p-3 text-xs font-medium", midia?.ok ? "bg-verde/12 text-[#0a6b43]" : "bg-ambar/16 text-[#7a4a05]")}>
            {midia?.ok ? <><CheckCheck className="size-4" /> Arquivo íntegro: abre do início ao fim.</> : <><TriangleAlert className="size-4" /> Vídeo com o fim cortado: toca até o ponto em que o arquivo existe.</>}
          </p>
          <Button onClick={() => { toast.success("Mídia incluída na pasta de entrega", { description: midia?.nome }); setMidia(null); }} className={btnPrimario}><FileDown className="size-4" /> Incluir na entrega</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
