import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LegacyNavbarShell from "./components/LegacyNavbarShell";
import DisableDevIndicator from "./components/DisableDevIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hust Media Support Center | Official Help Desk",
  description:
    "Official support channel for Hust Media - The AI Education & Security Intelligence Platform for Vietnamese students.",
  icons: {
    icon: "/favicon.ico",
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
        <DisableDevIndicator />
        <LegacyNavbarShell />
        <div className="min-h-screen md:pl-[280px]">{children}</div>
      </body>
    </html>
  );
}
