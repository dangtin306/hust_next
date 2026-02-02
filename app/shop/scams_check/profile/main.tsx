import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { alert_error, alert_success } from "../../../AppContext";
import { ClipLoader } from "react-spinners";
import { Helmet } from "react-helmet";

import Completed from "./Completed";
import Canceled from "./Canceled";
interface ProfileInfo {
  account_name: string;
  bank_name?: string;
  account_number?: string;
  phone_number?: string;
  scam_status: "Completed" | "Canceled" | string;
  amount?: string | number;
  description_scam?: string;
  updatedate?: string;
}

const ScamAlertMain = ({ onTitleChangea }: { onTitleChangea: any }) => {
  const { slug_1 } = useParams();
  const navigate = useNavigate();

  const [profile_info, set_profile_info] = useState<ProfileInfo | null>(null);

  const currentUrl = window.location.href;

  function laydulieu() {
    axios
      .get("https://hust.media/api/scams_check/profile.php", {
        params: {
          alias: slug_1,
        },
      })
      .then((response) => set_profile_info(response.data))
      .catch((error) => alert_error(error));
  }

  useEffect(() => {
    laydulieu();
  }, []);

  useEffect(() => {
    if (!profile_info || typeof onTitleChangea !== "function") {
      return;
    }
    const normalizedPhone = profile_info?.phone_number
      ? profile_info.phone_number.startsWith("+84")
        ? "0" + profile_info.phone_number.slice(3)
        : profile_info.phone_number
      : null;
    const detail = [
      profile_info?.bank_name,
      profile_info?.account_number,
      normalizedPhone,
    ]
      .filter(Boolean)
      .join(" ");
    const baseTitle = detail
      ? `${profile_info.account_name}: ${detail}`
      : `${profile_info.account_name}`;
    onTitleChangea(`${baseTitle} scammer bị tố cáo`.trim());
  }, [profile_info, onTitleChangea]);

  function saochep(value: any) {
    alert_success("Đã sao chép");
    window.saochepnative(value);
  }

  if (!profile_info) {
    return (
      <div
        style={{ textAlign: "center" }}
        className="mt-4 justify-center items-center"
      >
        <ClipLoader color="#fff" size={150} />
      </div>
    );
  }

  return (
    <>
      {/* Chọn giao diện theo scam_status */}
      {profile_info.scam_status === "Completed" && (
        <>
          <Helmet>
            <meta
              name="description_scam"
              content={`${profile_info?.account_name ? profile_info.account_name + ": " : ""}${[
                profile_info?.bank_name,
                profile_info?.account_number,
                profile_info?.phone_number
                  ? profile_info.phone_number.startsWith("+84")
                    ? "0" + profile_info.phone_number.slice(3)
                    : profile_info.phone_number
                  : null,
              ]
                .filter(Boolean)
                .join(
                  " ",
                )}; số tiền chiếm đoạt ${profile_info?.amount}; Nội dung: ${
                profile_info?.description_scam ?? ""
              } có bằng chứng tại hust media`.trim()}
            />
            <link rel="canonical" href={currentUrl} />
            <meta property="og:locale" content="vi_VN" />
            <meta property="og:type" content="article" />
            <meta
              property="og:title"
              content={`CTK "${profile_info.account_name}" bị tố cáo lừa đảo tại hust media`}
            />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content="HỆ THỐNG hust.media" />
            <meta
              property="article:publisher"
              content="https://t.me/dangbaiok"
            />
            <meta
              property="article:published_time"
              content={profile_info.updatedate}
            />
          </Helmet>

          <Completed
            profile_info={profile_info}
            currentUrl={currentUrl}
            onCopy={saochep}
            navigate={navigate}
          />
        </>
      )}

      {profile_info.scam_status === "Canceled" && <Canceled />}

      {/* Nếu có trạng thái khác thì fallback về Completed */}
      {!["Completed", "Canceled"].includes(profile_info.scam_status) && (
        <Completed
          profile_info={profile_info}
          currentUrl={currentUrl}
          onCopy={saochep}
          navigate={navigate}
        />
      )}
    </>
  );
};

export default ScamAlertMain;
