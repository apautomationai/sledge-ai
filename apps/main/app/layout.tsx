import type { Metadata } from "next";
import { Inter, League_Spartan } from "next/font/google";
import Script from "next/script";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { Toaster } from "@/components/layout/toaster";
import { Providers } from "@/components/providers";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
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
      {/* Google Tag Manager */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NDSVXVD4');`}
      </Script>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CS784LHP7E"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CS784LHP7E');
        `}
      </Script>

      <body
        className={cn(
          "bg-background font-sans antialiased",
          inter.variable,
          leagueSpartan.variable,
        )}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NDSVXVD4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Providers>
          {children}
          <Toaster />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
