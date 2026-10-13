"use client";

import Link from "next/link";
import { ArrowRight, Ban, CloudOff, HardDrive, Laptop, PowerOff, RefreshCcw, ShieldCheck, Smartphone, Stethoscope } from "lucide-react";
import { SiGoogledrive, SiIcloud, SiWhatsapp } from "react-icons/si";
import { buttonVariants } from "@/components/ui/button";
import { Chance, Chip, btnGlass, btnVerde } from "@/components/bits";
import { cn } from "@/lib/utils";
import { CASO, RESUMO, fmtN } from "@/lib/data";
import { useStore } from "@/lib/store";

const NAO_FAZER = [
  { icone: RefreshCcw, titulo: "Não reinstale o aplicativo", texto: "No aparelho antigo, reinstalar apaga a cópia local." },
  { icone: CloudOff, titulo: "Não toque em Fazer backup", texto: "O backup novo substitui o antigo na nuvem." },
  { icone: PowerOff, titulo: "Não formate o aparelho", texto: "A memória é cifrada: o que sai não volta." },
  { icone: Ban, titulo: "Não use limpadores", texto: "Aplicativos de limpeza apagam justamente essa pasta." },
];

const LUGARES = [
  { img: "/img/datacenter.jpg", icone: SiGoogledrive, nome: "Google Drive", texto: "O backup automático do Android. Guarda só a última versão, por isso a data é o que importa." },
  { img: "/img/nuvens.jpg", icone: SiIcloud, nome: "iCloud", texto: "No iPhone existem dois: o backup do aplicativo e o do aparelho inteiro, com datas diferentes." },
  { img: "/img/android.jpg", icone: Smartphone, nome: "Memória do aparelho", texto: "O Android guarda sozinho cópias dos últimos 7 dias na pasta Databases." },
  { img: "/img/notebook.jpg", icone: Laptop, nome: "Computador ou cartão", texto: "Backups do Finder ou iTunes e pastas copiadas não mudam sozinhos: são a fonte mais estável." },
];

export default function Inicio() {
  const { rotas, varredura } = useStore();
  const melhor = rotas[0];

  return (
    <div className="space-y-6">
      <section className="glass-noite relative overflow-hidden rounded-[2rem]">
        <img src="/img/hero-mao.jpg" alt="" className="animate-kenburns absolute inset-0 size-full object-cover opacity-45 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-r from-fundo/92 via-fundo/60 to-transparent" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:p-12">
          <div className="animate-rise">
            <Chip tom="claro" className="mb-5 py-1.5"><SiWhatsapp className="size-3.5" /> Recuperação de backup de conversas</Chip>
            <h1 className="text-4xl leading-[1.05] font-bold text-balance sm:text-5xl lg:text-[3.6rem]">
              Suas conversas ainda podem estar em <span className="text-grad">quatro lugares.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/85 sm:text-lg">
              Antes de qualquer tentativa, um diagnóstico diz onde o histórico ainda existe, qual caminho tem mais chance e o que não fazer pra não perder o que resta.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/diagnostico" className={cn(buttonVariants(), btnVerde, "sheen relative h-12 px-6 text-base")}>
                <Stethoscope className="size-5" /> Começar o diagnóstico <ArrowRight className="size-4" />
              </Link>
              <Link href={varredura === "concluida" ? "/conversas" : "/plano"} className={cn(buttonVariants({ variant: "outline" }), btnGlass, "h-12 border-white/40 bg-white/14 text-white hover:bg-white/25 hover:text-white")}>
                Ver o caso {CASO.id}
              </Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[{ n: fmtN(RESUMO.mensagens), t: "mensagens abertas no caso" }, { n: fmtN(RESUMO.fotos + RESUMO.audios + RESUMO.videos + RESUMO.docs), t: "mídias de volta" }, { n: "0", t: "testes no original" }].map((s) => (
                <div key={s.t} className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur">
                  <dt className="font-heading tabular text-2xl font-semibold">{s.n}</dt>
                  <dd className="mt-0.5 text-[11px] leading-tight text-white/75">{s.t}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden min-h-[26rem] lg:block">
            <div className="glass animate-float absolute top-2 right-4 w-72 rounded-3xl p-4 text-tinta" style={{ "--giro": "3deg" } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <Chance valor={melhor.chance} />
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Melhor caminho</p>
                  <p className="text-sm leading-snug font-semibold">{melhor.nome}</p>
                </div>
              </div>
            </div>
            <div className="glass animate-float absolute top-36 left-0 w-64 overflow-hidden rounded-3xl p-2 text-tinta [animation-delay:-2.5s]" style={{ "--giro": "-4deg" } as React.CSSProperties}>
              <img src="/img/bolo.jpg" alt="Foto recuperada de um bolo de aniversário colorido" className="h-36 w-full rounded-2xl object-cover" />
              <div className="flex items-center justify-between px-2 pt-2 pb-1">
                <span className="text-xs font-semibold">IMG-20261002-WA0014</span>
                <Chip tom="verde">recuperada</Chip>
              </div>
            </div>
            <div className="glass animate-float absolute right-0 bottom-0 w-72 rounded-3xl p-4 text-tinta [animation-delay:-4.5s]" style={{ "--giro": "2deg" } as React.CSSProperties}>
              <p className="flex items-center gap-2 text-xs font-semibold text-petroleo"><HardDrive className="size-4" /> msgstore-2026-10-03.1.db.crypt15</p>
              <p className="mt-1.5 text-sm">Última cópia antes da troca, com <b>48.212 mensagens</b>.</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-tinta/10"><span className="fluxo block h-full w-[86%] rounded-full bg-verde" /></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="t-nao" className="glass rounded-[1.75rem] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-nao" className="text-xl font-semibold">Até o diagnóstico, quatro coisas pra não fazer</h2>
          <Chip tom="ambar"><ShieldCheck className="size-3" /> cada uma delas pode apagar o que ainda existe</Chip>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NAO_FAZER.map((n) => (
            <div key={n.titulo} className="glass-soft rounded-2xl p-4">
              <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-risco/12 text-risco"><n.icone className="size-5" /></span>
              <p className="text-sm font-semibold">{n.titulo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-lugares">
        <h2 id="t-lugares" className="mb-4 text-2xl font-semibold">Onde o histórico costuma estar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LUGARES.map((l) => (
            <Link key={l.nome} href="/diagnostico" className="glass sheen group overflow-hidden rounded-3xl p-2 transition hover:-translate-y-1">
              <div className="relative h-40 overflow-hidden rounded-2xl">
                <img src={l.img} alt="" className="size-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-fundo/70 to-transparent" />
                <span className="chip-foto absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-xl text-petroleo"><l.icone className="size-5" /></span>
              </div>
              <div className="p-3">
                <h3 className="text-base font-semibold">{l.nome}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{l.texto}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
