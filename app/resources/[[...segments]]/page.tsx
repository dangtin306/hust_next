import type { Metadata } from "next";
import { cookies } from "next/headers";
import ProfileNav from "@/app/shop/resources/ProfileNav";
import OrdersMain from "@/app/shop/resources/orders_main";
import {
  buildServiceMetadata,
  fetchServiceInfoBySlug,
} from "@/app/shop/resources/service_info_server";

type PageProps = {
  params: Promise<{ segments?: string[] }>;
};

const DEFAULT_SLUG = "zoom-pro-chinhchu-12thang_31571";

const pickSlugFromSegments = (segments: string[]) => {
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const candidate = decodeURIComponent(segments[i] || "");
    if (/_(\d{3,})$/.test(candidate)) return candidate;
  }
  return DEFAULT_SLUG;
};

const parseRouteState = (segments: string[]) => {
  if (segments.length === 0) {
    return {
      slug1: "product",
      slug2: "play",
      slug3: "",
      slug4: "",
    };
  }

  const [s1 = "", s2 = "", s3 = "", s4 = ""] = segments;

  if (s1 === "product") {
    return {
      slug1: "product",
      slug2: s2 || "home",
      slug3: s3 || "",
      slug4: s4 || "",
    };
  }

  if (s1 === "mmo") {
    return {
      slug1: "mmo",
      slug2: s2 || "main",
      slug3: s3 || "",
      slug4: s4 || "",
    };
  }

  if (s1 === "sellers") {
    return {
      slug1: "sellers",
      slug2: s2 || "home",
      slug3: s3 || "",
      slug4: s4 || "",
    };
  }

  if (s1 === "api") {
    return {
      slug1: "product",
      slug2: "api",
      slug3: s2 || "",
      slug4: s3 || "",
    };
  }

  if (s1 === "home") {
    return {
      slug1: "product",
      slug2: "home",
      slug3: "",
      slug4: "",
    };
  }

  if (s1 === "accounts_history") {
    return {
      slug1: "product",
      slug2: "accounts_history",
      slug3: "",
      slug4: "",
    };
  }

  if (s1 === "play" || s1 === "search" || s1 === "support") {
    return {
      slug1: "product",
      slug2: s1,
      slug3: s2 || "",
      slug4: s3 || "",
    };
  }

  return {
    slug1: "product",
    slug2: "play",
    slug3: "",
    slug4: "",
  };
};

const shouldShowOrdersMain = (slug2: string, slug: string) => {
  if (slug2 !== "play" && slug2 !== "search") return false;
  return /_(\d{3,})$/.test(slug);
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments = [] } = await params;
  const routeState = parseRouteState(segments);
  const slug = pickSlugFromSegments(segments);
  const showOrdersMain = shouldShowOrdersMain(routeState.slug2, slug);

  if (!showOrdersMain) return {};

  const { serviceInfo } = await fetchServiceInfoBySlug(slug);
  return buildServiceMetadata(serviceInfo, slug);
}

export default async function ResourcesCatchAllPage({ params }: PageProps) {
  const { segments = [] } = await params;
  const cookieStore = await cookies();
  const initialMarket = cookieStore.get("national_market")?.value || "vi";
  const routeState = parseRouteState(segments);
  const slug = pickSlugFromSegments(segments);
  const showOrdersMain = shouldShowOrdersMain(routeState.slug2, slug);
  const productData = showOrdersMain
    ? await fetchServiceInfoBySlug(slug)
    : { serviceInfo: null, errorText: "" };

  return (
    <div className="min-h-[60vh] py-2">
      <ProfileNav
        slug={slug}
        initialSlug1={routeState.slug1}
        initialSlug2={routeState.slug2}
        initialSlug3={routeState.slug3}
        initialSlug4={routeState.slug4}
      />
      {showOrdersMain ? (
        <OrdersMain
          slug={slug}
          initialServiceInfo={productData.serviceInfo}
          initialErrorText={productData.errorText}
          initialMarket={initialMarket}
        />
      ) : null}
    </div>
  );
}
