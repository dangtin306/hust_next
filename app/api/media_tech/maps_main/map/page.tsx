import type { Metadata } from "next";
import CityMapFrame from "../home/CityMapFrame";

export const metadata: Metadata = {
  title: "Knowledge: Bản đồ tri thức | Media Tech",
  description: "Bản đồ thành phố tri thức của Media Tech: người xem, sản phẩm, công nghệ, kỹ thuật, hạ tầng.",
};

export default function MediaTechMapPage() {
  return (
    <CityMapFrame
      viewPath="/next/api/mt/maps_main/view/index.html"
      title="Bản đồ tri thức Media Tech"
      backHref="/next/api/mt/maps_main/home"
    />
  );
}
