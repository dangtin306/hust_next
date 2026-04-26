export default function FooterWeb({ initialHost = "", initialLatestVersion = "" }) {
  const normalizedHost = String(initialHost || "").toLowerCase();
  const resolvedLatestVersion = String(initialLatestVersion || "");
  const hasResolvedLatestVersion = resolvedLatestVersion !== "";
  const isLatestVersionThree = resolvedLatestVersion === "3";
  const siteMapHref = normalizedHost.includes("nofake")
    ? "https://nginx.nofake.wiki/go/site_map/check_healing.xml"
    : "https://hust.media/api/sitemap/hust_media.xml";

  return (
    <footer className="mt-auto w-full bg-slate-950/40 bg-hust-glass backdrop-blur-md border-t border-white/10 text-white py-1 md:py-1 text-xs md:text-base leading-none flex-none">
      <div
        className={`mx-auto px-[12px] py-[14px] max-[480px]:px-2 ${isLatestVersionThree ? "max-[480px]:py-[8px]" : "max-[480px]:py-[12px]"} flex flex-col md:flex-row justify-between items-center ${isLatestVersionThree ? "gap-1 md:gap-1" : "gap-2 md:gap-1"} text-[13px] md:text-[15px]`}
      >
        {/* 1. Chính sách (Bên trái PC / Giữa Mobile) */}
        <div className="flex flex-row gap-16 sm:gap-5 text-white w-full md:w-auto justify-center md:justify-start md:flex-1 order-1 md:order-1 font-medium">
          <a
            href="/next/info/terms_service"
            className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <span className="text-white leading-none group-hover:text-white transition-colors duration-200">
              Terms of Service
            </span>
          </a>
          <a
            href="/next/info/private_policy"
            className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <span className="text-white leading-none group-hover:text-white transition-colors duration-200">
              Privacy Policy
            </span>
          </a>
          <a
            href={siteMapHref}
            target="_blank"
            rel="noreferrer"
            className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <span className="text-white leading-none group-hover:text-white transition-colors duration-200">
              Site Map
            </span>
          </a>
        </div>

        {/* 2. Bản quyền (Ở giữa) */}
        <div className="mt-0.5 mb-0.5 text-white leading-none text-center w-full md:w-auto md:flex-none order-2 md:order-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          © Hust Media 2021 - 2026
        </div>

        {/* 3. Nút tải App (Bên phải PC / Lên đầu Mobile) */}
        <div
          className={`flex items-center gap-4 w-full md:w-auto justify-center md:justify-end md:flex-1 order-3 md:order-3 ${isLatestVersionThree ? "min-h-0 mt-0 mb-0.5" : "min-h-[36px]"}`}
        >
          {hasResolvedLatestVersion ? (
            isLatestVersionThree ? (
              <>
                <a
                  href="/next/info/about_us"
                  className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
                  style={{ textDecoration: "none" }}
                >
                  <span className="text-white leading-none group-hover:text-white transition-colors duration-200">
                    About Us
                  </span>
                </a>
                <a
                  href="/next/support"
                  className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
                  style={{ textDecoration: "none" }}
                >
                  <span className="text-white leading-none group-hover:text-white transition-colors duration-200">
                    Support
                  </span>
                </a>
              </>
            ) : (
              <>
                {/* App Store */}
                <a
                  href="https://apps.apple.com/us/app/hust-media/id6444485454"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://hust.media/img/icon/app-store.svg"
                    alt="Download on the App Store"
                    className="h-[32px] md:h-[36px]"
                  />
                </a>

                {/* Google Play */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.hm.hustmedia"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://hust.media/img/icon/google-play.svg"
                    alt="Get it on Google Play"
                    className="h-[32px] md:h-[36px]"
                  />
                </a>
              </>
            )
          ) : null}
        </div>
      </div>
    </footer>
  );
}
