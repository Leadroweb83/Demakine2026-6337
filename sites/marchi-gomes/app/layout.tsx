import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { site } from "@/content/site";
import { MotionRoot } from "@/components/motion-root";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Advocacia empresarial, civil, tributária e trabalhista`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
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
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#070b14", colorScheme: "dark" };

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
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
        </MotionRoot>
      </body>
    </html>
  );
}
