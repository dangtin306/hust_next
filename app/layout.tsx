import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LegacyNavbarShell from "./components/LegacyNavbarShell";
import DisableDevIndicator from "./components/DisableDevIndicator";
import SimpleTopBar from "./components/SimpleTopBar";

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
    "Official support channel for Hust Media - The AI Education & System Monitor for Vietnamese students.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DisableDevIndicator />
        <LegacyNavbarShell />
        <div className="flex-1 transition-all duration-300 md:ml-[280px]">
          <div className="antialiased bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
            <div className="layout-wrapper layout-content-navbar">
              <div className="layout-container">
                <aside
                  id="layout-menu"
                  className="layout-menu menu-vertical menu bg-menu-theme"
                >
                  <div style={{ position: "fixed" }}>
                    <br />
                    <div className="app-brand demo" />
                  </div>
                </aside>
                <div className="layout-page">
                  <SimpleTopBar />
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
