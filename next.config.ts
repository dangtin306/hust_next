import type { NextConfig } from "next";
import path from "path";

const hideDevIndicator = process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR === "1";

const nextConfig: NextConfig = {
  basePath: "/next",
  ...(hideDevIndicator ? { devIndicators: false } : {}),
  experimental: { externalDir: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const reactPath = path.resolve(__dirname, "node_modules/react");
      config.resolve.alias = {
        ...config.resolve.alias,
        react: reactPath,
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
        "react/jsx-runtime": path.resolve(reactPath, "jsx-runtime"),
        "react/jsx-dev-runtime": path.resolve(reactPath, "jsx-dev-runtime"),
      };
    }

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/services/development",
        destination: "/community/services/development",
      },
      {
        source: "/features",
        destination: "/community/features",
      },
      {
        source: "/docs",
        destination: "/community/docs",
      },
      {
        source: "/docs/:path*",
        destination: "/community/docs/:path*",
      },
      {
        source: "/convert_national_market",
        destination: "/community/services/national_market",
      },
      {
        source: "/support",
        destination: "/community/services/support_page",
      },
      {
        source: "/hustadmin",
        destination: "/shop/hustadmin",
      },
      {
        source: "/hustadmin/:path*",
        destination: "/shop/hustadmin/:path*",
      },
      {
        source: "/check/:slug",
        destination: "/shop/scams_check/profile/:slug",
      },
      {
        source: "/check/:path*",
        destination: "/shop/scams_check/:path*",
      },
      {
        source: "/orders_once/:slug_2",
        destination: "/shop/ai?slug_2=:slug_2",
      },
      {
        source: "/shop/ai/:slug_2",
        destination: "/shop/ai?slug_2=:slug_2",
      },
    ];
  },
};

export default nextConfig;
