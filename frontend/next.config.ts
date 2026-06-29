import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === "production" ? "https://capstoneprojectg2-production.up.railway.app" : "http://localhost:5000",
  },
};

export default nextConfig;
