import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { RegionBar } from "@/components/layout/region-bar";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://westpart.ua"),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08356f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      /* Next 16 більше не вимикає сам scroll-behavior: smooth на час
         переходу, тож плавна прокрутка розтягувала б і стрибок на верх
         нової сторінки. Атрибут повертає попередню поведінку
         (docs/01-app/02-guides/upgrading/version-16.md) */
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-200 focus:rounded-md focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Перейти до вмісту
        </a>
        {/* Над шапкою й поза sticky: довідкова смуга їде вгору разом зі
            сторінкою. Щоб вона не зникала назовсім, scroll-padding-top у
            globals.css змушує роутер вертати прокрутку на самий верх */}
        <RegionBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
