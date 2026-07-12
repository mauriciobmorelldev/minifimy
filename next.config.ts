import type { NextConfig } from "next";

const remoteUrls = [process.env.WORDPRESS_URL, process.env.WOOCOMMERCE_URL].filter(Boolean) as string[];
const remotePatterns = remoteUrls.flatMap((url) => {
  try {
    const parsed = new URL(url);
    return [
      {
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
        hostname: parsed.hostname,
      },
    ];
  } catch {
    return [];
  }
});

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "connect-src 'self' https:",
      "frame-src 'self' https:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [48, 64, 96, 128, 192, 256, 384, 512],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
