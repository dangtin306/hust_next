import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import NationalMarketPage from "../national_market";
import SupportPage from "../support_page";

type ServicePageProps = {
  params: Promise<{ service: string }>;
};

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params;
  const cookieStore = await cookies();
  const latestVersion = cookieStore.get("latest_version")?.value || "";
  const limitToCoreMarkets = latestVersion === "3";

  if (service === "national_market") {
    return <NationalMarketPage limitToCoreMarkets={limitToCoreMarkets} />;
  }
  if (service === "support_page") {
    return <SupportPage />;
  }

  return notFound();
}
