import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBarWrapper } from "@/components/ui/navbar-wrapper";
import { VexelLogo } from "@/components/ui/vexel-logo";
import { PageAnimator } from "@/components/ui/page-animator";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vexel – The #1 Shopify Theme",
  description: "The most complete Shopify theme for building stunning ecommerce stores.",
  icons: {
    icon: '/diamond-logo.svg',
    shortcut: '/diamond-logo.svg',
    apple: '/diamond-logo.svg',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <VexelLogo />
        <NavBarWrapper />
        <PageAnimator>{children}</PageAnimator>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
