import type { Metadata } from "next";
import TermsPage from "../../community/info_main/TermsPage";

export const metadata: Metadata = {
  title: "Terms of Service | Hust Media",
  description:
    "Terms governing access and use of Hust Media services, including account usage, digital credits, user conduct, and policy updates.",
};

export default function TermsServicePage() {
  return <TermsPage />;
}
