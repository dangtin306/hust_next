"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { alert_error, alert_success } from "../../../../AppContext";
import Completed from "../Completed";
import Canceled from "../Canceled";

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

export default function ProfileClient({
  profileInfo: initialProfile,
  slug,
}: {
  profileInfo: ProfileInfo | null;
  slug: string;
}) {
  const router = useRouter();
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(initialProfile);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    setProfileInfo(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    if (!slug) return;
    if (initialProfile?.account_name) return;
    axios
      .get("https://hust.media/api/scams_check/profile.php", {
        params: { alias: slug },
      })
      .then((response) => setProfileInfo(response.data))
      .catch((error) => alert_error(error));
  }, [slug, initialProfile]);

  const handleCopy = (value: string) => {
    alert_success("Đã sao chép");
    if (typeof window !== "undefined" && (window as any).saochepnative) {
      (window as any).saochepnative(value);
      return;
    }
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value).catch(() => undefined);
    }
  };

  if (!profileInfo) {
    return (
      <div className="mt-4 flex justify-center items-center">
        <ClipLoader color="#fff" size={150} />
      </div>
    );
  }

  return (
    <>
      {profileInfo.scam_status === "Canceled" && <Canceled />}

      {profileInfo.scam_status === "Completed" && (
        <Completed
          profile_info={profileInfo}
          currentUrl={currentUrl}
          onCopy={handleCopy}
          navigate={(path: string) => router.push(path)}
        />
      )}

      {! ["Completed", "Canceled"].includes(profileInfo.scam_status) && (
        <Completed
          profile_info={profileInfo}
          currentUrl={currentUrl}
          onCopy={handleCopy}
          navigate={(path: string) => router.push(path)}
        />
      )}
    </>
  );
}
