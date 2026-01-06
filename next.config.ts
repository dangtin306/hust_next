import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
