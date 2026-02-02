import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

interface ProfileInfo {
  account_name: string;
  bank_name?: string;
  account_number?: string;
  phone_number?: string;
  scam_status: "Completed" | "Canceled" | string;
  amount?: string | number;
  description_scam?: string;
  updatedate?: string;
  links_scam?: string;
}

export const dynamic = "force-dynamic";

const fetchProfile = async (slug: string): Promise<ProfileInfo | null> => {
  try {
    const res = await fetch(
      `https://hust.media/api/scams_check/profile.php?alias=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

const buildDescriptionScam = (profile: ProfileInfo) => {
  const normalizedPhone = profile?.phone_number
    ? profile.phone_number.startsWith("+84")
      ? "0" + profile.phone_number.slice(3)
      : profile.phone_number
    : null;
  return `${profile?.account_name ? profile.account_name + ": " : ""}${[
    profile?.bank_name,
    profile?.account_number,
    normalizedPhone,
  ]
    .filter(Boolean)
    .join(" ")}; số tiền chiếm đoạt ${profile?.amount}; Nội dung: ${
    profile?.description_scam ?? ""
  } có bằng chứng tại hust media`.trim();
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await fetchProfile(slug);
  if (!profile) {
    return {
      title: "Không tìm thấy trang",
      description: "Không tìm thấy dữ liệu báo cáo.",
    };
  }

  const normalizedPhone = profile?.phone_number
    ? profile.phone_number.startsWith("+84")
      ? "0" + profile.phone_number.slice(3)
      : profile.phone_number
    : null;
  const detail = [profile?.bank_name, profile?.account_number, normalizedPhone]
    .filter(Boolean)
    .join(" ");
  const baseTitle = detail
    ? `${profile.account_name}: ${detail} scammer bị tố cáo`
    : `${profile.account_name} scammer bị tố cáo`;
  const descriptionScam = buildDescriptionScam(profile);

  return {
    title: baseTitle,
    description: descriptionScam,
    other: {
      description_scam: descriptionScam,
    },
    openGraph: {
      title: `CTK "${profile.account_name}" bị tố cáo lừa đảo tại hust media`,
      description: descriptionScam,
      type: "article",
    },
  };
}

export default async function ScamProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await fetchProfile(slug);
  return <ProfileClient profileInfo={profile} slug={slug} />;
}
