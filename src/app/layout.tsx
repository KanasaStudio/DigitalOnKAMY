import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { MOTION_BOOT_SCRIPT, RevealObserver } from "@/components/motion/reveal-observer";
import { SoundBridge } from "@/components/sound/sound-bridge";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n/client";
import { createTranslator } from "@/i18n/core";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(await getLocale());
  return {
    title: { default: t("meta.title"), template: `%s · KAMY` },
    description: t("meta.description"),
    // Private development: keep every page out of search engines.
    robots: { index: false, follow: false, nocache: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#090b0f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Sets motion and pointer mode before first paint (no flash, no hidden content without JS). */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
      </head>
      <body>
        <RevealObserver />
        <SoundBridge />
        <I18nProvider locale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
