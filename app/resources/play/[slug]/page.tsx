import type { Metadata } from "next";
import { cookies } from "next/headers";
import ProfileNav from "@/app/shop/resources/ProfileNav";
import OrdersMain from "@/app/shop/resources/orders_main";
import {
  buildServiceMetadata,
  fetchServiceInfoBySlug,
} from "@/app/shop/resources/service_info_server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { serviceInfo } = await fetchServiceInfoBySlug(slug);
  return buildServiceMetadata(serviceInfo, slug);
}

export default async function ResourcesPlaySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const { serviceInfo, errorText } = await fetchServiceInfoBySlug(slug);
  const cookieStore = await cookies();
  const initialMarket = cookieStore.get("national_market")?.value || "vi";

  return (
    <div className="min-h-[60vh] py-2">
      <ProfileNav slug={slug} />
      <OrdersMain
        slug={slug}
        initialServiceInfo={serviceInfo}
        initialErrorText={errorText}
        initialMarket={initialMarket}
      />
    </div>
  );
}
