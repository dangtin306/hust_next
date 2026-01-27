export default function FooterWeb() {
  return (
    <footer className="mt-auto w-full bg-slate-950/40 bg-hust-glass backdrop-blur-md border-t border-white/10 text-gray-200 py-0.5 md:py-0.5 text-xs md:text-base leading-none flex-none">
      <div className=" mx-auto px-3 py-3 max-sm:px-2 max-sm:py-2 flex flex-col md:flex-row justify-between items-center gap-1 md:gap-1">
        {/* 1. Chính sách (Bên trái PC / Giữa Mobile) */}
        <div className="flex gap-5 text-slate-200/90 w-full md:w-auto justify-center md:justify-start md:flex-1 order-1 md:order-1 font-medium">
          <a
            href="/next/info/terms_service"
            className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <span className="text-slate-200/90 leading-none group-hover:text-white transition-colors duration-200">
              Terms of Service
            </span>
          </a>
          <a
            href="/next/info/private_policy"
            className="group hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <span className="text-slate-200/90 leading-none group-hover:text-white transition-colors duration-200">
              Privacy Policy
            </span>
          </a>
        </div>

        {/* 2. Bản quyền (Ở giữa) */}
        <div className="text-slate-200/80 leading-none text-center w-full md:w-auto md:flex-none order-2 md:order-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          © Hust Media 2021 - 2026
        </div>

        {/* 3. Nút tải App (Bên phải PC / Lên đầu Mobile) */}
        <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end md:flex-1 order-3 md:order-3">
          {/* App Store */}
          <a
            href="https://apps.apple.com/us/app/hust-media/id6444485454"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="Download on the App Store"
              className="h-8 md:h-9"
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
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="h-8 md:h-9"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
