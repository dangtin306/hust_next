import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LegacyNavbarShell from "./components/LegacyNavbarShell";
import DisableDevIndicator from "./components/DisableDevIndicator";
import IgnoreMetaMaskExtensionErrors from "./components/IgnoreMetaMaskExtensionErrors";
import SimpleTopBar from "./components/SimpleTopBar";
import Footer_web from "./components/Footer_web";
import SupportButton from "./community/services/SupportButton";
import { getSidebarMenuServer } from "./components/sidebar_menu_server";

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

const getMainDomainFromHost = (host: string) => {
  const parts = host.split(".").filter(Boolean);
  return parts.length > 2 ? parts[parts.length - 2] : parts[0] || "hust";
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const initialHost =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    "";
  const initialLatestVersion = cookieStore.get("latest_version")?.value || "";
  const apikey = cookieStore.get("apikey")?.value || "";
  const nationalMarketRaw = cookieStore.get("national_market")?.value || "vi";
  const national_market =
    nationalMarketRaw === "vi" || nationalMarketRaw === "en" ? nationalMarketRaw : "vi";
  const mainDomainCookie = cookieStore.get("main_domain")?.value || "";
  const initialHostNoPort = initialHost.replace(/:\d+$/, "");
  const main_domain =
    mainDomainCookie || (initialHostNoPort ? getMainDomainFromHost(initialHostNoPort) : "hust");
  const initialDisplayHostname = initialHostNoPort
    ? initialHostNoPort.includes("tecom.pro")
      ? "hust.media"
      : initialHostNoPort
    : "hust.media";

  const sidebarResponse = await getSidebarMenuServer({
    apikey,
    main_domain,
    national_market,
  });
  const initialSidebarMenu = sidebarResponse.api_results.sidebar_menu;
  const initialSidebarVersion = sidebarResponse.api_results.latest_version;
  const initialSidebarStatus = sidebarResponse.api_status;
  const resolvedSidebarVersion =
    initialSidebarVersion !== "" && initialSidebarVersion !== null && initialSidebarVersion !== undefined
      ? initialSidebarVersion
      : initialLatestVersion;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DisableDevIndicator />
        <IgnoreMetaMaskExtensionErrors />
        <LegacyNavbarShell
          initialMenu={initialSidebarMenu}
          initialLatestVersion={resolvedSidebarVersion}
          initialMarket={national_market}
          initialDisplayHostname={initialDisplayHostname}
          initialApiStatus={initialSidebarStatus}
        />
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
                <div className="layout-page flex min-h-screen min-h-[100dvh] flex-col">
                  <SimpleTopBar initialHost={initialHost} />
                  <div className="flex-1">{children}</div>
                  <Footer_web
                    initialHost={initialHost}
                    initialLatestVersion={initialLatestVersion}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <SupportButton />
      </body>
    </html>
  );
}
