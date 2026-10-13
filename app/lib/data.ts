// Dados locais do Resgata. Tudo aqui tem o formato que uma API devolveria:
// ids, datas ISO, relações por id. Trocar por chamadas reais não muda as telas.

export type Sistema = "android" | "ios";
export type Ocorrido = "troca" | "formatou" | "desinstalou" | "sobrescrito" | "quebrou" | "numero";
export type Fonte = "drive" | "icloud" | "local" | "computador";
export type Cripto = "sim" | "nao" | "naosei";

export interface Diagnostico {
  sistema: Sistema;
  modelo: string;
  temAparelho: boolean;
  ocorrido: Ocorrido;
  fontes: Fonte[];
  ultimoBackup: string;
  mesmoNumero: boolean;
  cripto: Cripto;
  temChave: boolean;
  conta: string;
}

export const CASO = {
  id: "RG-2610",
  cliente: "Renata Albuquerque",
  negocio: "Ateliê Doce Renata",
  avatar: "/img/p-renata.jpg",
  aberto: "2026-10-12T14:20:00-03:00",
  telefone: "+55 31 9 8842-1107",
};

export const DIAGNOSTICO_PADRAO: Diagnostico = {
  sistema: "android",
  modelo: "Samsung Galaxy A54",
  temAparelho: true,
  ocorrido: "troca",
  fontes: ["drive", "local"],
  ultimoBackup: "2026-10-02",
  mesmoNumero: true,
  cripto: "naosei",
  temChave: false,
  conta: "renata.atelie@gmail.com",
};

export const OCORRIDOS: Record<Ocorrido, { nome: string; texto: string }> = {
  troca: { nome: "Troquei de aparelho", texto: "A restauração no novo veio vazia ou com conversas antigas." },
  formatou: { nome: "O aparelho foi formatado", texto: "Restauração de fábrica ou troca de sistema." },
  desinstalou: { nome: "Desinstalei o aplicativo", texto: "Ao reinstalar, o histórico não voltou." },
  sobrescrito: { nome: "Um backup novo apagou o antigo", texto: "O aplicativo salvou por cima sem as conversas." },
  quebrou: { nome: "O aparelho quebrou ou molhou", texto: "A tela não liga, mas o aparelho está comigo." },
  numero: { nome: "Mudei de número", texto: "O backup ficou preso ao número anterior." },
};

export const FONTES: Record<Fonte, { nome: string; texto: string; so: Sistema | "ambos" }> = {
  drive: { nome: "Google Drive", texto: "Backup automático da conta Google", so: "android" },
  icloud: { nome: "iCloud", texto: "Backup do aplicativo ou do iPhone inteiro", so: "ios" },
  local: { nome: "Memória do aparelho", texto: "Pasta Databases, com cópias dos últimos 7 dias", so: "android" },
  computador: { nome: "Computador ou cartão", texto: "Backup pelo Finder, iTunes, cabo ou cartão SD", so: "ambos" },
};

export interface Rota {
  id: string;
  fonte: Fonte | "aparelho";
  nome: string;
  img: string;
  chance: number;
  prazo: string;
  resumo: string;
  passos: string[];
  risco: string;
  motivo: string;
}

const limitar = (n: number) => Math.max(3, Math.min(92, Math.round(n)));

/** Ordena os caminhos de recuperação pela chance real, a partir das respostas do diagnóstico. */
export function calcularRotas(d: Diagnostico): Rota[] {
  const semChave = d.cripto === "sim" && !d.temChave;
  const rotas: Rota[] = [];

  if (d.sistema === "android") {
    if (d.temAparelho) {
      let c = 80;
      let motivo = "O aparelho antigo está com você e o aplicativo guarda sozinho cópias dos últimos 7 dias.";
      if (d.ocorrido === "formatou") { c = 16; motivo = "A formatação apaga a pasta e a memória é cifrada: só sobra o que ainda não foi regravado."; }
      if (d.ocorrido === "desinstalou") { c = 48; motivo = "Nos Android recentes a desinstalação leva a pasta junto, a não ser que você tenha marcado para manter os dados."; }
      if (d.ocorrido === "quebrou") { c = 62; motivo = "Com a tela morta ainda dá pra ler a memória por cabo, se a depuração ou o modo de transferência responderem."; }
      if (semChave) { c = Math.min(c, 34); motivo = "Os arquivos existem, mas com backup protegido por senha é preciso a senha ou a chave de 64 dígitos pra abrir."; }
      if (d.fontes.includes("local")) c += 6;
      rotas.push({
        id: "local", fonte: "local", nome: "Cópias locais na memória do aparelho", img: "/img/android.jpg", chance: limitar(c), prazo: "1 a 2 dias",
        resumo: "Ler a pasta Databases do aparelho antigo, onde ficam o msgstore atual e as cópias diárias.",
        passos: ["Copiar Android/media/com.whatsapp inteira pro computador, sem abrir o aplicativo", "Conferir a data e o tamanho de cada msgstore.db.crypt14 ou crypt15", "Restaurar a cópia mais completa num aparelho de teste com o mesmo número"],
        risco: "Abrir o aplicativo no aparelho antigo dispara um backup novo e empurra a cópia mais velha pra fora.",
        motivo,
      });
    }
    let c = 68;
    let motivo = "O backup da conta Google continua lá enquanto ninguém salvar outro por cima.";
    if (d.ocorrido === "sobrescrito") { c = 14; motivo = "O Drive guarda só o último backup do aplicativo. Se o novo já subiu, o antigo não existe mais lá."; }
    if (d.ocorrido === "troca") { c = 44; motivo = "Se o aparelho novo já fez backup, ele substituiu o antigo. Vale conferir a data antes de qualquer coisa."; }
    if (!d.mesmoNumero) { c -= 22; motivo = "O backup do Drive só abre com o número que o criou. Dá pra reativar o chip antigo por alguns dias."; }
    if (semChave) { c = 6; motivo = "Backup com criptografia de ponta a ponta sem a senha nem a chave não abre, nem pelo suporte."; }
    if (!d.fontes.includes("drive")) c -= 10;
    rotas.push({
      id: "drive", fonte: "drive", nome: "Backup na conta do Google Drive", img: "/img/datacenter.jpg", chance: limitar(c), prazo: "1 dia",
      resumo: "Conferir a data e o tamanho do backup guardado na conta Google e restaurar num aparelho de teste.",
      passos: ["Ver em drive.google.com > Armazenamento > Backups a data e o tamanho", "Desligar o backup automático no aparelho novo antes de tudo", "Restaurar num aparelho de teste com o mesmo número e a mesma conta"],
      risco: "Um único backup novo substitui o antigo na nuvem, sem lixeira e sem versão anterior.",
      motivo,
    });
    const temPc = d.fontes.includes("computador");
    rotas.push({
      id: "computador", fonte: "computador", nome: "Cópia em computador ou cartão SD", img: "/img/hd.jpg", chance: limitar(temPc ? 64 : 18), prazo: "1 a 3 dias",
      resumo: "Procurar pastas WhatsApp copiadas pra um computador, HD externo ou cartão de memória.",
      passos: ["Buscar por msgstore*.crypt* e pela pasta Media nos discos", "Recuperar arquivos apagados do cartão SD sem gravar nada nele", "Juntar as mídias recuperadas ao histórico restaurado"],
      risco: "Gravar qualquer arquivo no cartão antes da leitura pode cobrir o que foi apagado.",
      motivo: temPc ? "Você indicou que existe uma cópia fora do aparelho, e ela não depende da nuvem." : "Não há indício de cópia fora do aparelho, mas vale uma busca rápida nos discos.",
    });
  } else {
    if (d.temAparelho && d.ocorrido !== "formatou" && d.ocorrido !== "desinstalou") {
      rotas.push({
        id: "aparelho", fonte: "aparelho", nome: "Banco de dados ainda no iPhone", img: "/img/iphone.jpg", chance: limitar(d.ocorrido === "quebrou" ? 58 : 78), prazo: "1 dia",
        resumo: "Fazer um backup completo do iPhone no computador e extrair o ChatStorage.sqlite dele.",
        passos: ["Backup local cifrado pelo Finder ou iTunes, sem atualizar o sistema", "Extrair o grupo net.whatsapp.WhatsApp.shared do backup", "Ler o ChatStorage.sqlite e a pasta de mídias"],
        risco: "Apagar o aplicativo no iPhone remove o banco na hora, sem pasta de sobra.",
        motivo: "O aplicativo ainda está instalado, então o banco de conversas continua no aparelho.",
      });
    }
    let c = 70;
    let motivo = "O backup do aplicativo fica no iCloud Drive da conta e volta ao reinstalar com o mesmo número.";
    if (d.ocorrido === "sobrescrito") { c = 16; motivo = "O iCloud guarda só o último backup do aplicativo. O que vale agora é o backup do iPhone inteiro."; }
    if (!d.mesmoNumero) { c -= 22; motivo = "O backup do iCloud só restaura com o número que o criou."; }
    if (semChave) { c = 6; motivo = "Backup com criptografia de ponta a ponta sem a senha nem a chave não abre."; }
    if (!d.fontes.includes("icloud")) c -= 10;
    rotas.push({
      id: "icloud", fonte: "icloud", nome: "Backup do aplicativo no iCloud", img: "/img/nuvens.jpg", chance: limitar(c), prazo: "1 dia",
      resumo: "Conferir a data do último backup em Ajustes > Conversas > Backup e restaurar num iPhone de teste.",
      passos: ["Ver a data e o tamanho do backup sem tocar em Fazer backup agora", "Desligar o backup automático", "Reinstalar num iPhone de teste com a mesma conta Apple e o mesmo número"],
      risco: "Tocar em Fazer backup agora substitui o que está na nuvem pelo estado atual, que pode estar vazio.",
      motivo,
    });
    rotas.push({
      id: "icloud-inteiro", fonte: "icloud", nome: "Backup do iPhone inteiro no iCloud", img: "/img/iphone-mesa.jpg", chance: limitar(d.ocorrido === "formatou" ? 60 : 52), prazo: "2 dias",
      resumo: "Restaurar um backup antigo do aparelho inteiro num iPhone de teste, que traz o aplicativo com os dados daquela data.",
      passos: ["Listar os backups do aparelho em Ajustes > iCloud > Gerenciar", "Restaurar o mais antigo num iPhone reserva", "Exportar as conversas desse aparelho de teste"],
      risco: "A Apple mantém poucos backups e apaga os mais antigos conforme novos são feitos.",
      motivo: "O backup do aparelho é separado do backup do aplicativo e costuma guardar uma data anterior.",
    });
    const temPc = d.fontes.includes("computador");
    rotas.push({
      id: "computador", fonte: "computador", nome: "Backup no Finder ou iTunes", img: "/img/notebook.jpg", chance: limitar(temPc ? 82 : 22), prazo: "1 a 2 dias",
      resumo: "Abrir um backup do iPhone guardado no computador e extrair as conversas direto do arquivo.",
      passos: ["Localizar a pasta MobileSync/Backup e a data de cada backup", "Abrir com a senha do backup, se for cifrado", "Extrair ChatStorage.sqlite e as mídias"],
      risco: "Sincronizar o iPhone de novo com o computador substitui o backup antigo pelo atual.",
      motivo: temPc ? "Um backup em computador não muda sozinho: é a fonte mais estável que existe." : "Vale conferir se algum computador já foi usado pra sincronizar esse iPhone.",
    });
  }
  return rotas.sort((a, b) => b.chance - a.chance);
}

export const CONGELAR = [
  { id: "auto", titulo: "Desligar o backup automático", texto: "Em Configurações > Conversas > Backup, mudar pra Nunca. É o que impede o backup vazio de subir." },
  { id: "aviao", titulo: "Aparelho antigo em modo avião", texto: "Sem rede, o aplicativo não sincroniza nem atualiza sozinho." },
  { id: "reinstalar", titulo: "Não reinstalar nem limpar dados", texto: "Reinstalar no aparelho antigo é o jeito mais comum de perder a cópia local." },
  { id: "copia", titulo: "Copiar a pasta inteira antes de qualquer teste", texto: "Todo teste é feito na cópia. O original fica intocado, com o hash anotado." },
  { id: "chip", titulo: "Chip do número original à mão", texto: "A restauração pede o código por SMS do mesmo número que criou o backup." },
];

export type EstadoArquivo = "integro" | "parcial" | "vazio" | "cifrado";

export interface Arquivo {
  id: string;
  nome: string;
  origem: "local" | "drive" | "midia";
  data: string;
  tamanho: string;
  estado: EstadoArquivo;
  sha: string;
  nota: string;
  em: number; // % da varredura em que aparece
}

export const ARQUIVOS: Arquivo[] = [
  { id: "a1", nome: "msgstore.db.crypt15", origem: "local", data: "2026-10-09T02:00:00-03:00", tamanho: "3,1 MB", estado: "vazio", sha: "9f1c0b72e4a8", nota: "Criado depois da troca: só 41 mensagens.", em: 8 },
  { id: "a2", nome: "msgstore-2026-10-08.1.db.crypt15", origem: "local", data: "2026-10-08T02:00:00-03:00", tamanho: "3,0 MB", estado: "vazio", sha: "44d07a1be93c", nota: "Mesmo estado vazio do dia seguinte.", em: 15 },
  { id: "a3", nome: "msgstore-2026-10-03.1.db.crypt15", origem: "local", data: "2026-10-03T02:00:00-03:00", tamanho: "186,4 MB", estado: "integro", sha: "c2e85f90a7d1", nota: "Última cópia antes da troca. 48.212 mensagens.", em: 27 },
  { id: "a4", nome: "msgstore-2026-10-02.1.db.crypt15", origem: "local", data: "2026-10-02T02:00:00-03:00", tamanho: "186,1 MB", estado: "integro", sha: "71ab3d5c08ef", nota: "Cópia de reserva, um dia antes.", em: 36 },
  { id: "a5", nome: "wa.db.crypt15", origem: "local", data: "2026-10-03T02:00:00-03:00", tamanho: "1,2 MB", estado: "integro", sha: "0be6c41f7a22", nota: "Nomes e fotos de 312 contatos.", em: 44 },
  { id: "a6", nome: "Backup do Google Drive", origem: "drive", data: "2026-10-09T02:04:00-03:00", tamanho: "3,1 MB", estado: "vazio", sha: "9f1c0b72e4a8", nota: "Já substituído pelo backup do aparelho novo.", em: 56 },
  { id: "a7", nome: "Media/WhatsApp Images", origem: "midia", data: "2026-10-03T19:42:00-03:00", tamanho: "4,8 GB", estado: "integro", sha: "2.318 arquivos", nota: "Fotos intactas na memória.", em: 68 },
  { id: "a8", nome: "Media/WhatsApp Voice Notes", origem: "midia", data: "2026-10-03T18:10:00-03:00", tamanho: "612 MB", estado: "integro", sha: "912 arquivos", nota: "Áudios intactos.", em: 79 },
  { id: "a9", nome: "Media/WhatsApp Video", origem: "midia", data: "2026-09-30T21:15:00-03:00", tamanho: "2,9 GB", estado: "parcial", sha: "164 arquivos", nota: "11 vídeos com o fim cortado.", em: 88 },
  { id: "a10", nome: "Media/WhatsApp Documents", origem: "midia", data: "2026-10-01T10:02:00-03:00", tamanho: "96 MB", estado: "integro", sha: "87 arquivos", nota: "PDFs de orçamento e notas.", em: 95 },
];

export const ETAPAS_VARREDURA = [
  { ate: 20, nome: "Imagem da pasta do aplicativo", texto: "Cópia bit a bit pro disco de trabalho" },
  { ate: 50, nome: "Leitura das cópias locais", texto: "Data, tamanho e cabeçalho de cada msgstore" },
  { ate: 62, nome: "Conferência do Google Drive", texto: "Data e tamanho do backup na conta" },
  { ate: 96, nome: "Inventário das mídias", texto: "Fotos, áudios, vídeos e documentos" },
  { ate: 100, nome: "Abertura da melhor cópia", texto: "Restauração no aparelho de teste" },
];

export const LOG = [
  { em: 2, t: "adb devices -> SM-A546E autorizado, modo avião ativo" },
  { em: 5, t: "pull /sdcard/Android/media/com.whatsapp -> 8,6 GB" },
  { em: 12, t: "sha256 da imagem anotado no relatório" },
  { em: 18, t: "Databases: 9 arquivos msgstore encontrados" },
  { em: 27, t: "msgstore-2026-10-03 -> 186,4 MB, cabeçalho crypt15 válido" },
  { em: 31, t: "cópias de 04 a 07/10 ausentes: aplicativo ficou fechado" },
  { em: 40, t: "08 e 09/10 -> 3 MB cada, criados após a troca" },
  { em: 52, t: "Drive: 1 backup, 09/10 02:04, 3,1 MB" },
  { em: 58, t: "Drive não tem versão anterior: rota descartada" },
  { em: 66, t: "Media/WhatsApp Images -> 2.318 arquivos" },
  { em: 78, t: "Voice Notes -> 912 arquivos .opus" },
  { em: 87, t: "Video -> 164 arquivos, 11 truncados" },
  { em: 94, t: "Documents -> 87 arquivos" },
  { em: 97, t: "restaurando cópia de 03/10 no aparelho de teste" },
  { em: 100, t: "48.212 mensagens abertas em 61 conversas" },
];

export interface Mensagem {
  id: string;
  de: "eu" | "outro";
  autor?: string;
  hora: string;
  texto?: string;
  img?: string;
  audio?: number;
  doc?: string;
}

export interface Conversa {
  id: string;
  nome: string;
  avatar: string;
  grupo?: boolean;
  etiqueta: "cliente" | "familia" | "fornecedor" | "amigos";
  mensagens: number;
  midias: number;
  de: string;
  ate: string;
  estado: "completa" | "parcial";
  lacuna?: string;
  ultima: string;
  dia: string;
  msgs: Mensagem[];
}

export const ETIQUETAS: Record<Conversa["etiqueta"], string> = { cliente: "Cliente", familia: "Família", fornecedor: "Fornecedor", amigos: "Amigos" };

export const CONVERSAS: Conversa[] = [
  {
    id: "c1", nome: "Camila Prado", avatar: "/img/p-camila.jpg", etiqueta: "cliente", mensagens: 1284, midias: 96, de: "2025-03-14", ate: "2026-10-03", estado: "completa",
    ultima: "Fechado então! Sábado às 15h eu passo aí", dia: "Sexta, 2 de outubro",
    msgs: [
      { id: "m1", de: "outro", hora: "09:12", texto: "Rê, bom dia! Consegue fazer o bolo da Helena pro sábado? Ela faz 6 anos" },
      { id: "m2", de: "eu", hora: "09:15", texto: "Bom dia, Camila! Consigo sim. Mesmo recheio do ano passado, brigadeiro com morango?" },
      { id: "m3", de: "outro", hora: "09:16", texto: "Isso! E ela quer colorido, tipo esse aqui" },
      { id: "m4", de: "outro", hora: "09:16", img: "/img/bolo.jpg" },
      { id: "m5", de: "eu", hora: "09:21", texto: "Lindo, faço nessa linha. Pra 30 pessoas fica R$ 340,00, com os docinhos R$ 520,00" },
      { id: "m6", de: "eu", hora: "09:21", doc: "Orçamento 1047 - Helena 6 anos.pdf" },
      { id: "m7", de: "outro", hora: "09:30", audio: 23 },
      { id: "m8", de: "outro", hora: "09:31", texto: "Pode fechar com os docinhos. Já mandei o sinal de R$ 260,00 no Pix" },
      { id: "m9", de: "eu", hora: "09:33", texto: "Recebi! Anotado: sábado, retirada às 15h" },
      { id: "m10", de: "outro", hora: "09:34", texto: "Fechado então! Sábado às 15h eu passo aí" },
    ],
  },
  {
    id: "c2", nome: "Família Albuquerque", avatar: "/img/familia.jpg", grupo: true, etiqueta: "familia", mensagens: 9412, midias: 1130, de: "2023-01-02", ate: "2026-10-03", estado: "completa",
    ultima: "Pai: Domingo o almoço é aqui em casa", dia: "Quinta, 1 de outubro",
    msgs: [
      { id: "m1", de: "outro", autor: "Tia Sônia", hora: "18:02", texto: "Gente, achei as fotos da praia do ano passado" },
      { id: "m2", de: "outro", autor: "Tia Sônia", hora: "18:02", img: "/img/familia.jpg" },
      { id: "m3", de: "outro", autor: "Léo", hora: "18:05", texto: "Essa ficou boa demais. Bora repetir em janeiro?" },
      { id: "m4", de: "eu", hora: "18:09", texto: "Bora! Eu levo a sobremesa" },
      { id: "m5", de: "outro", autor: "Léo", hora: "18:10", img: "/img/praia.jpg" },
      { id: "m6", de: "outro", autor: "Pai", hora: "18:20", audio: 41 },
      { id: "m7", de: "outro", autor: "Pai", hora: "18:22", texto: "Domingo o almoço é aqui em casa" },
    ],
  },
  {
    id: "c3", nome: "Bruno - Embalagens Minas", avatar: "/img/p-bruno.jpg", etiqueta: "fornecedor", mensagens: 642, midias: 58, de: "2024-08-20", ate: "2026-10-02", estado: "completa",
    ultima: "Nota fiscal em anexo, entrega na terça", dia: "Quarta, 30 de setembro",
    msgs: [
      { id: "m1", de: "eu", hora: "10:40", texto: "Bruno, preciso de 200 caixas kraft 20x20 e 500 forminhas nº 5" },
      { id: "m2", de: "outro", hora: "10:52", texto: "Tenho tudo em estoque. Mesmo preço do último pedido, R$ 418,00" },
      { id: "m3", de: "eu", hora: "10:55", texto: "Pode faturar. Entrega no ateliê" },
      { id: "m4", de: "outro", hora: "11:30", doc: "NF-e 008812 Embalagens Minas.pdf" },
      { id: "m5", de: "outro", hora: "11:30", texto: "Nota fiscal em anexo, entrega na terça" },
    ],
  },
  {
    id: "c4", nome: "Clara Menezes", avatar: "/img/p-clara.jpg", etiqueta: "cliente", mensagens: 318, midias: 27, de: "2026-02-08", ate: "2026-10-01", estado: "parcial", lacuna: "Sem mensagens entre 4 e 7 de junho",
    ultima: "Os balões chegaram, ficou tudo lindo", dia: "Terça, 29 de setembro",
    msgs: [
      { id: "m1", de: "outro", hora: "14:03", texto: "Renata, a mesa do chá de bebê ficou assim, olha" },
      { id: "m2", de: "outro", hora: "14:03", img: "/img/baloes.jpg" },
      { id: "m3", de: "eu", hora: "14:10", texto: "Que capricho! Os docinhos chegaram inteiros?" },
      { id: "m4", de: "outro", hora: "14:12", texto: "Chegaram sim. Os balões chegaram, ficou tudo lindo" },
    ],
  },
  {
    id: "c5", nome: "Contabilidade Edu", avatar: "/img/p-edu.jpg", etiqueta: "fornecedor", mensagens: 207, midias: 64, de: "2025-01-10", ate: "2026-09-30", estado: "completa",
    ultima: "Guia do DAS de setembro em anexo", dia: "Quarta, 30 de setembro",
    msgs: [
      { id: "m1", de: "outro", hora: "08:30", texto: "Renata, bom dia. Preciso das notas de setembro até sexta" },
      { id: "m2", de: "eu", hora: "08:44", img: "/img/documentos.jpg" },
      { id: "m3", de: "eu", hora: "08:44", texto: "Seguem as que tenho aqui, o resto mando à tarde" },
      { id: "m4", de: "outro", hora: "16:20", doc: "DAS-MEI 09-2026.pdf" },
      { id: "m5", de: "outro", hora: "16:20", texto: "Guia do DAS de setembro em anexo" },
    ],
  },
  {
    id: "c6", nome: "Meninas do pilates", avatar: "/img/amigas.jpg", grupo: true, etiqueta: "amigos", mensagens: 5630, midias: 842, de: "2024-02-11", ate: "2026-10-03", estado: "completa",
    ultima: "Lu: Café depois da aula?", dia: "Sábado, 3 de outubro",
    msgs: [
      { id: "m1", de: "outro", autor: "Lu", hora: "07:48", texto: "Café depois da aula?" },
      { id: "m2", de: "outro", autor: "Bia", hora: "07:50", img: "/img/cafe.jpg" },
      { id: "m3", de: "outro", autor: "Bia", hora: "07:50", texto: "Já tô aqui guardando mesa" },
      { id: "m4", de: "eu", hora: "07:55", texto: "Chego em dez minutos" },
    ],
  },
  {
    id: "c7", nome: "Luana Teixeira", avatar: "/img/p-lu.jpg", etiqueta: "amigos", mensagens: 2140, midias: 311, de: "2023-06-05", ate: "2026-10-02", estado: "completa",
    ultima: "Olha o show de ontem!", dia: "Sexta, 2 de outubro",
    msgs: [
      { id: "m1", de: "outro", hora: "11:02", texto: "Olha o show de ontem!" },
      { id: "m2", de: "outro", hora: "11:02", img: "/img/show.jpg" },
      { id: "m3", de: "eu", hora: "11:20", texto: "Que inveja. Semana que vem eu vou com você" },
    ],
  },
  {
    id: "c8", nome: "Pai", avatar: "/img/p-pai.jpg", etiqueta: "familia", mensagens: 3871, midias: 498, de: "2023-01-02", ate: "2026-10-03", estado: "completa",
    ultima: "O Thor mandou um oi", dia: "Sábado, 3 de outubro",
    msgs: [
      { id: "m1", de: "outro", hora: "16:14", img: "/img/cachorro.jpg" },
      { id: "m2", de: "outro", hora: "16:14", texto: "O Thor mandou um oi" },
      { id: "m3", de: "eu", hora: "16:30", texto: "Saudade desse bicho. Domingo eu levo um osso pra ele" },
    ],
  },
  {
    id: "c9", nome: "Tia Sônia", avatar: "/img/p-tia.jpg", etiqueta: "familia", mensagens: 1506, midias: 204, de: "2023-03-19", ate: "2026-09-27", estado: "parcial", lacuna: "11 vídeos com o fim cortado",
    ultima: "Receita da feijoada da vó, guarda bem", dia: "Domingo, 27 de setembro",
    msgs: [
      { id: "m1", de: "outro", hora: "12:40", img: "/img/comida.jpg" },
      { id: "m2", de: "outro", hora: "12:41", texto: "Receita da feijoada da vó, guarda bem" },
      { id: "m3", de: "outro", hora: "12:41", doc: "Receitas da vó Lourdes.pdf" },
      { id: "m4", de: "eu", hora: "13:05", texto: "Guardado, tia. Essa não pode sumir nunca" },
    ],
  },
];

export type TipoMidia = "foto" | "video" | "audio" | "doc";

export interface Midia {
  id: string;
  tipo: TipoMidia;
  src?: string;
  nome: string;
  conversa: string;
  data: string;
  tamanho: string;
  ok: boolean;
}

export const MIDIAS: Midia[] = [
  { id: "f1", tipo: "foto", src: "/img/bolo.jpg", nome: "IMG-20261002-WA0014.jpg", conversa: "c1", data: "2026-10-02", tamanho: "412 KB", ok: true },
  { id: "f2", tipo: "foto", src: "/img/familia.jpg", nome: "IMG-20261001-WA0031.jpg", conversa: "c2", data: "2026-10-01", tamanho: "1,2 MB", ok: true },
  { id: "f3", tipo: "foto", src: "/img/praia.jpg", nome: "IMG-20261001-WA0033.jpg", conversa: "c2", data: "2026-10-01", tamanho: "980 KB", ok: true },
  { id: "f4", tipo: "foto", src: "/img/baloes.jpg", nome: "IMG-20260929-WA0007.jpg", conversa: "c4", data: "2026-09-29", tamanho: "730 KB", ok: true },
  { id: "f5", tipo: "video", src: "/img/show.jpg", nome: "VID-20261002-WA0002.mp4", conversa: "c7", data: "2026-10-02", tamanho: "18,4 MB", ok: true },
  { id: "f6", tipo: "foto", src: "/img/cachorro.jpg", nome: "IMG-20261003-WA0009.jpg", conversa: "c8", data: "2026-10-03", tamanho: "640 KB", ok: true },
  { id: "f7", tipo: "foto", src: "/img/cafe.jpg", nome: "IMG-20261003-WA0002.jpg", conversa: "c6", data: "2026-10-03", tamanho: "512 KB", ok: true },
  { id: "f8", tipo: "foto", src: "/img/comida.jpg", nome: "IMG-20260927-WA0011.jpg", conversa: "c9", data: "2026-09-27", tamanho: "890 KB", ok: true },
  { id: "f9", tipo: "foto", src: "/img/aniversario.jpg", nome: "IMG-20260920-WA0018.jpg", conversa: "c1", data: "2026-09-20", tamanho: "455 KB", ok: true },
  { id: "f10", tipo: "video", src: "/img/surf.jpg", nome: "VID-20260914-WA0005.mp4", conversa: "c9", data: "2026-09-14", tamanho: "22,1 MB", ok: false },
  { id: "f11", tipo: "foto", src: "/img/rio.jpg", nome: "IMG-20260907-WA0021.jpg", conversa: "c7", data: "2026-09-07", tamanho: "1,6 MB", ok: true },
  { id: "f12", tipo: "foto", src: "/img/pizza.jpg", nome: "IMG-20260905-WA0004.jpg", conversa: "c6", data: "2026-09-05", tamanho: "702 KB", ok: true },
  { id: "f13", tipo: "foto", src: "/img/gato.jpg", nome: "IMG-20260830-WA0012.jpg", conversa: "c7", data: "2026-08-30", tamanho: "388 KB", ok: true },
  { id: "f14", tipo: "foto", src: "/img/cozinha.jpg", nome: "IMG-20260822-WA0008.jpg", conversa: "c2", data: "2026-08-22", tamanho: "1,1 MB", ok: true },
  { id: "f15", tipo: "foto", src: "/img/jantar.jpg", nome: "IMG-20260815-WA0027.jpg", conversa: "c2", data: "2026-08-15", tamanho: "940 KB", ok: true },
  { id: "f16", tipo: "foto", src: "/img/filhote.jpg", nome: "IMG-20260802-WA0003.jpg", conversa: "c8", data: "2026-08-02", tamanho: "296 KB", ok: true },
  { id: "f17", tipo: "video", src: "/img/lago.jpg", nome: "VID-20260718-WA0001.mp4", conversa: "c2", data: "2026-07-18", tamanho: "31,7 MB", ok: true },
  { id: "f18", tipo: "foto", src: "/img/pug.jpg", nome: "IMG-20260704-WA0016.jpg", conversa: "c6", data: "2026-07-04", tamanho: "350 KB", ok: true },
  { id: "d1", tipo: "doc", nome: "Orçamento 1047 - Helena 6 anos.pdf", conversa: "c1", data: "2026-10-02", tamanho: "84 KB", ok: true },
  { id: "d2", tipo: "doc", nome: "NF-e 008812 Embalagens Minas.pdf", conversa: "c3", data: "2026-09-30", tamanho: "126 KB", ok: true },
  { id: "d3", tipo: "doc", nome: "DAS-MEI 09-2026.pdf", conversa: "c5", data: "2026-09-30", tamanho: "58 KB", ok: true },
  { id: "d4", tipo: "doc", nome: "Receitas da vó Lourdes.pdf", conversa: "c9", data: "2026-09-27", tamanho: "2,3 MB", ok: true },
  { id: "u1", tipo: "audio", nome: "PTT-20261002-WA0006.opus", conversa: "c1", data: "2026-10-02", tamanho: "0:23", ok: true },
  { id: "u2", tipo: "audio", nome: "PTT-20261001-WA0019.opus", conversa: "c2", data: "2026-10-01", tamanho: "0:41", ok: true },
  { id: "u3", tipo: "audio", nome: "PTT-20260925-WA0003.opus", conversa: "c8", data: "2026-09-25", tamanho: "1:12", ok: true },
];

// Cobertura do histórico aberto: mensagens por mês e o que ficou de fora.
export const COBERTURA = [
  { mes: "Jan", n: 4210, ok: true }, { mes: "Fev", n: 3980, ok: true }, { mes: "Mar", n: 5120, ok: true },
  { mes: "Abr", n: 4760, ok: true }, { mes: "Mai", n: 5890, ok: true }, { mes: "Jun", n: 4480, ok: false },
  { mes: "Jul", n: 5310, ok: true }, { mes: "Ago", n: 5640, ok: true }, { mes: "Set", n: 6020, ok: true },
  { mes: "Out", n: 802, ok: false },
];

export const RESUMO = { mensagens: 48212, conversas: 61, fotos: 2318, audios: 912, videos: 164, videosCortados: 11, docs: 87, contatos: 312, ate: "2026-10-03", perdidos: 6 };

export const FORMATOS = [
  { id: "aparelho", nome: "De volta no aparelho novo", texto: "Restauro o histórico no seu aparelho e o aplicativo abre como era em 3 de outubro.", recomendado: true },
  { id: "html", nome: "Arquivo pra ler no computador", texto: "Todas as conversas em páginas navegáveis, com fotos e áudios, sem precisar do aplicativo." },
  { id: "pdf", nome: "PDF por conversa", texto: "Um PDF pra cada conversa escolhida, com data e hora. Serve pra guardar pedidos e combinados." },
  { id: "zip", nome: "Pasta com as mídias", texto: "Fotos, vídeos, áudios e documentos organizados por conversa e por mês." },
] as const;

export type FormatoId = (typeof FORMATOS)[number]["id"];

const nf = new Intl.NumberFormat("pt-BR");
export const fmtN = (n: number) => nf.format(n);
export const fmtData = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...opts }).format(new Date(iso.length === 10 ? `${iso}T12:00:00-03:00` : iso));
export const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export const iniciais = (nome: string) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
export const tomChance = (c: number) => (c >= 60 ? "alta" : c >= 30 ? "media" : "baixa");
