import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { site } from "@/content/site";
import { MotionRoot } from "@/components/motion-root";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { visibleArticles } from "@/content/articles";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { Tracking } from "@/components/tracking";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Escritório de advocacia em Limeira, SP`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/", languages: { "pt-BR": "/", en: "/en", es: "/es", "es-PY": "/es", "x-default": "/" } },
  robots: site.launchReady ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0a1322", colorScheme: "dark" };

// Marca que ha JS antes da primeira pintura; se o motion nao subir em 3s, libera o conteudo.
const bootScript = `(function(d){d.classList.add('js');try{if(sessionStorage.getItem('mg-intro'))d.classList.add('intro-done')}catch(e){}setTimeout(function(){d.classList.add('intro-done');if(!d.classList.contains('motion-ready'))d.classList.remove('js')},3000)})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
          Pular para o conteúdo
        </a>
        <MotionRoot>
          <Header showArticles={visibleArticles().length > 0} />
          <main id="conteudo">{children}</main>
          <Footer showArticles={visibleArticles().length > 0} />
        </MotionRoot>
        <WhatsAppFloat />
        <Tracking />
      </body>
    </html>
  );
}
