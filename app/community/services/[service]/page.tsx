import { notFound } from "next/navigation";
import NationalMarketPage from "../national_market";
import SupportPage from "../support_page";

type ServicePageProps = {
  params: Promise<{ service: string }>;
};

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params;

  if (service === "national_market") {
    return <NationalMarketPage />;
  }
  if (service === "support_page") {
    return <SupportPage />;
  }

  return notFound();
}
