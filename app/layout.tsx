import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | philter",
    default: "philter - Transaction Platform for Co-ops & Condos",
  },
  description:
    "A purpose-built transaction platform for residential co-ops and condos in professionally managed buildings.",
  keywords: [
    "coop",
    "condo",
    "transaction platform",
    "board application",
    "residential real estate",
    "property management",
  ],
  authors: [{ name: "philter" }],
  creator: "philter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://philter.app",
    siteName: "philter",
    title: "philter - Transaction Platform for Co-ops & Condos",
    description:
      "A purpose-built transaction platform for residential co-ops and condos in professionally managed buildings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "philter - Transaction Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "philter - Transaction Platform for Co-ops & Condos",
    description:
      "A purpose-built transaction platform for residential co-ops and condos in professionally managed buildings.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
