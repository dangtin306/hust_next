import "server-only";
import type { Metadata } from "next";

export type ServiceInfo = {
  id: string | number;
  accounts_caption: string;
  accounts_description: string;
  accounts_amount: string | number;
  accounts_sold: string | number;
  accounts_price: string | number;
  accounts_seller_id?: string | number;
  shop_caption?: string;
  shop_description?: string;
  shop_phone?: string;
};

type ApiResponse = {
  services?: ServiceInfo;
};

type ServiceInfoResult = {
  serviceId: string;
  serviceInfo: ServiceInfo | null;
  errorText: string;
};

const SERVICE_INFO_ENDPOINT =
  "https://nginx.hust.media/services/p2p/resources/info";

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const extractServiceIdFromSlug = (slug: string) => {
  const decoded = safeDecode(String(slug || "").trim());
  const match = decoded.match(/_(\d{3,})$/);
  return match ? match[1] : "";
};

export const fetchServiceInfoBySlug = async (
  slug: string
): Promise<ServiceInfoResult> => {
  const serviceId = extractServiceIdFromSlug(slug);
  if (!serviceId) {
    return {
      serviceId: "",
      serviceInfo: null,
      errorText: "Product ID not found in URI.",
    };
  }

  try {
    const response = await fetch(
      `${SERVICE_INFO_ENDPOINT}?id=${encodeURIComponent(serviceId)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return {
        serviceId,
        serviceInfo: null,
        errorText: `Failed to fetch product data (HTTP ${response.status}).`,
      };
    }

    const data = (await response.json()) as ApiResponse;
    if (!data?.services) {
      return {
        serviceId,
        serviceInfo: null,
        errorText: `No product data returned for ID ${serviceId}.`,
      };
    }

    return {
      serviceId,
      serviceInfo: data.services,
      errorText: "",
    };
  } catch (error) {
    return {
      serviceId,
      serviceInfo: null,
      errorText: error instanceof Error ? error.message : "Failed to fetch product data.",
    };
  }
};

export const buildServiceMetadata = (
  serviceInfo: ServiceInfo | null,
  slug?: string
): Metadata => {
  if (!serviceInfo) {
    const fallbackName = slug ? safeDecode(slug) : "Product";
    return {
      title: `${fallbackName} | Hust Media`,
      description: "Product information is currently unavailable.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const caption = String(serviceInfo.accounts_caption || "Hust Media Product").trim();
  const description = String(
    serviceInfo.accounts_description || `Buy ${caption} safely on Hust Media.`
  ).trim();

  return {
    title: caption,
    description,
    openGraph: {
      title: caption,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: caption,
      description,
    },
  };
};
