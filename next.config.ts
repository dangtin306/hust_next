import type { NextConfig } from "next";
import path from "path";
import uriConfig from "./src/uri_config.json";

const hideDevIndicator = process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR === "1";

type RewriteRule = {
  source: string;
  destination: string;
  basePath?: false;
  locale?: false;
};

type RouteTree = {
  [key: string]: RewriteRule | RouteTree;
};

const isRewriteRule = (value: RewriteRule | RouteTree): value is RewriteRule =>
  "source" in value && "destination" in value;

const flattenRoutes = (tree: RouteTree): RewriteRule[] =>
  Object.values(tree).flatMap((route) =>
    isRewriteRule(route) ? [route] : flattenRoutes(route),
  );

const rewriteRules = flattenRoutes(uriConfig.routes);

const nextConfig: NextConfig = {
  basePath: uriConfig.basePath,
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    emotion: true,
  },
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
    return rewriteRules;
  },
};

export default nextConfig;
