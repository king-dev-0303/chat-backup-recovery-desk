"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CONVERSAS, DIAGNOSTICO_PADRAO, calcularRotas, type Diagnostico, type FormatoId, type Rota } from "@/lib/data";

type EstadoVarredura = "parada" | "rodando" | "pausada" | "concluida";

interface Estado {
  diag: Diagnostico;
  diagFeito: boolean;
  rotaId: string | null;
  congelado: string[];
  varredura: EstadoVarredura;
  progresso: number;
  marcadas: string[];
  formato: FormatoId;
  entregue: boolean;
  apagado: boolean;
}

const INICIAL: Estado = {
  diag: DIAGNOSTICO_PADRAO,
  diagFeito: true,
  rotaId: null,
  congelado: [],
  varredura: "parada",
  progresso: 0,
  marcadas: CONVERSAS.map((c) => c.id),
  formato: "aparelho",
  entregue: false,
  apagado: false,
};

interface Store extends Estado {
  pronto: boolean;
  rotas: Rota[];
  rota: Rota;
  salvarDiag: (d: Diagnostico) => void;
  escolherRota: (id: string) => void;
  alternarCongelar: (id: string) => void;
  setVarredura: (v: EstadoVarredura, progresso?: number) => void;
  setProgresso: (p: number) => void;
  alternarMarcada: (id: string) => void;
  marcarTodas: (ids: string[]) => void;
  setFormato: (f: FormatoId) => void;
  entregar: () => void;
  apagarCaso: () => void;
  reiniciar: () => void;
}

const Ctx = createContext<Store | null>(null);
const CHAVE = "resgata:v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [e, setE] = useState<Estado>(INICIAL);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      // Uma varredura interrompida ao fechar a aba volta pausada, nunca rodando sozinha.
      if (salvo) { const s = JSON.parse(salvo) as Estado; setE({ ...INICIAL, ...s, varredura: s.varredura === "rodando" ? "pausada" : s.varredura }); }
    } catch { /* armazenamento indisponível: segue com o caso padrão */ }
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try { localStorage.setItem(CHAVE, JSON.stringify(e)); } catch { /* sem persistência */ }
  }, [e, pronto]);

  const mudar = useCallback((p: Partial<Estado> | ((a: Estado) => Partial<Estado>)) => setE((a) => ({ ...a, ...(typeof p === "function" ? p(a) : p) })), []);
  const rotas = useMemo(() => calcularRotas(e.diag), [e.diag]);
  const rota = rotas.find((r) => r.id === e.rotaId) ?? rotas[0];

  const valor: Store = {
    ...e, pronto, rotas, rota,
    // Mudar o diagnóstico invalida o plano e a varredura feitos com as respostas antigas.
    salvarDiag: (diag) => mudar({ diag, diagFeito: true, rotaId: null, varredura: "parada", progresso: 0, entregue: false, apagado: false }),
    escolherRota: (rotaId) => mudar({ rotaId }),
    alternarCongelar: (id) => mudar((a) => ({ congelado: a.congelado.includes(id) ? a.congelado.filter((x) => x !== id) : [...a.congelado, id] })),
    setVarredura: (varredura, progresso) => mudar((a) => ({ varredura, progresso: progresso ?? a.progresso })),
    setProgresso: (progresso) => mudar({ progresso }),
    alternarMarcada: (id) => mudar((a) => ({ marcadas: a.marcadas.includes(id) ? a.marcadas.filter((x) => x !== id) : [...a.marcadas, id] })),
    marcarTodas: (marcadas) => mudar({ marcadas }),
    setFormato: (formato) => mudar({ formato }),
    entregar: () => mudar({ entregue: true }),
    apagarCaso: () => mudar({ ...INICIAL, diagFeito: false, apagado: true }),
    reiniciar: () => mudar({ ...INICIAL }),
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore fora do StoreProvider");
  return s;
}
