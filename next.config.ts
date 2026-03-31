import type { NextConfig } from "next";

const wordpressUrl = process.env.WORDPRESS_URL;
let wordpressHost: string | undefined;
try {
  wordpressHost = wordpressUrl ? new URL(wordpressUrl).hostname : undefined;
} catch {
  wordpressHost = undefined;
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    domains: wordpressHost ? [wordpressHost] : [],
  },
};

export default nextConfig;
