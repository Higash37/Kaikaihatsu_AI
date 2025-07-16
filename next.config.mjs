import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

// PWA設定
const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  // 開発環境では PWA を無効化 - 警告メッセージ抑制のため
  disable: true,
  // PWA関連の設定
  buildExcludes: [/middleware-manifest\.json$/],
  clientsClaim: true,
  cacheId: "love-navi-pwa",
  inlineWorkboxRuntime: true,
  cleanupOutdatedCaches: true,
};

const config = withPWA(pwaConfig)(nextConfig);

export default config;
