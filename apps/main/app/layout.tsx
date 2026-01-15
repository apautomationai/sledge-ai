import type { Metadata } from "next";
import { Inter, League_Spartan } from "next/font/google";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { Toaster } from "@/components/layout/toaster";
import { Providers } from "@/components/providers";
import "@/instrumentation-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getsledge.com"),
  title: "Sledge: The Builder's AI Office",
  description:
    "AI construction management software that automates the construction back office. Built by builders, for builders.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: "Sledge AI",
    type: "website",
    title: "Sledge: The Builder's AI Office",
    description:
      "AI construction management software that automates the construction back office. Built by builders, for builders.",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Sledge: The Builder's AI Office",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sledge: The Builder's AI Office",
    description:
      "AI construction management software that automates the construction back office. Built by builders, for builders.",
    images: ["/web-app-manifest-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn(
          "bg-background font-sans antialiased",
          inter.variable,
          leagueSpartan.variable,
        )}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
