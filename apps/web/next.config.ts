import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@muzzap/shared"],
  webpack: (config) => {
    // @muzzap/shared is consumed straight from its TS source (NodeNext-style ".js" specifiers
    // pointing at ".ts" files, for apps/api's Node ESM resolution); teach webpack the same alias.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
