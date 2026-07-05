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

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
};

export default nextConfig;