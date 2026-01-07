import type { Metadata } from "next";
import { Inter, League_Spartan } from "next/font/google";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { Toaster } from "@/components/layout/toaster";
import { Providers } from "@/components/providers";
import "@/instrumentation-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const leagueSpartan = League_Spartan({ subsets: ["latin"], variable: "--font-league-spartan" });

export const metadata: Metadata = {
  metadataBase: new URL("https://getsledge.com"),
  title: "Sledge: The Builder's AI Office",
  description: "A modern dashboard to manage and process invoices with AI-powered data extraction.",
  openGraph: {
    siteName: "SLEDGE AI",
    type: "website",
    images: [
      {
        url: "/images/logos/icon.png",
        width: 512,
        height: 512,
        alt: "Sledge: The Builder's AI Office",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn("bg-background font-sans antialiased", inter.variable, leagueSpartan.variable)}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
