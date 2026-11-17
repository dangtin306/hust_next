import type { Metadata } from "next";
import CityMapFrame from "../../../media_tech/maps_main/home/CityMapFrame";

export const metadata: Metadata = {
  title: "Knowledge: Bản đồ tri thức | Hust Media",
  description: "Bản đồ thành phố tri thức của Hust Media: khách hàng, sản phẩm, công nghệ, kỹ thuật, hạ tầng.",
};

export default function HustMapPage() {
  return (
    <CityMapFrame
      viewPath="/next/api/hust/maps_main/view/index.html"
      title="Bản đồ tri thức Hust Media"
      backHref="/next/api/hust/maps_main/home"
    />
  );
}
