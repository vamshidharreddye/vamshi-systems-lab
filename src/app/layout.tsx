import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { XRayProvider } from "@/components/xray/XRayProvider";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", display: "swap", weight: ["400", "500", "600"] });

function configuredMetadataBase(): URL {
  if (!siteConfig.url) return new URL("http://localhost:3000");
  try {
    return new URL(siteConfig.url);
  } catch {
    return new URL("http://localhost:3000");
  }
}

const metadataBase = configuredMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "Vamshi Endurthi" }],
  creator: "Vamshi Endurthi",
  keywords: ["WiFi simulation", "wireless propagation", "interactive RF", "signal playground", "software engineering"],
  openGraph: { title: siteConfig.name, description: siteConfig.description, siteName: siteConfig.name, type: "website" },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { themeColor: "#070a0c", colorScheme: "dark", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className={`${instrument.variable} ${plexMono.variable}`}><XRayProvider>{children}</XRayProvider></body></html>;
}
