import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF가 WebP보다 작다(히어로 이미지 12.3KB → 9.0KB). 지원하지 않는 브라우저는 WebP로 받는다.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
