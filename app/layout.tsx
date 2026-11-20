import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { themeColors, themeScript } from "@/lib/theme";
import { ThemeSync } from "@/components/shell/ThemeToggle";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "opsz"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Aventuras de a dos", template: "%s · Aventuras" },
  description: "Nuestros planes, recuerdos y aventuras juntos",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Aventuras", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // El tema por defecto es el oscuro; si eligen otro, applyTheme() actualiza este color.
  themeColor: themeColors.dark,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: el script del <head> pone data-theme antes de que React hidrate.
    <html lang="es" data-theme="dark" className={`${fraunces.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <ThemeSync />
        {children}
        <noscript>
          <style>{`.reveal-scope [data-reveal]{visibility:visible!important}`}</style>
        </noscript>
        <Toaster
          position="top-center"
          offset={16}
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-line !bg-paper !text-ink !shadow-lift !font-sans",
              description: "!text-muted",
            },
          }}
        />
      </body>
    </html>
  );
}
