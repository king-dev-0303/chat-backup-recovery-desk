import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const corpo = Manrope({ variable: "--font-corpo", subsets: ["latin"] });
const titulo = Sora({ variable: "--font-titulo", subsets: ["latin"] });
const codigo = JetBrains_Mono({ variable: "--font-codigo", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resgata - recuperação de backup de conversas",
  description:
    "Diagnóstico, plano e recuperação de conversas e mídias perdidas: Google Drive, iCloud e cópias locais, sempre trabalhando numa cópia do original.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${corpo.variable} ${titulo.variable} ${codigo.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <StoreProvider>
          <TooltipProvider>
            <Shell>{children}</Shell>
            <Toaster position="bottom-right" theme="light" richColors />
          </TooltipProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
