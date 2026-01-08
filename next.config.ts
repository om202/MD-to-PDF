import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export for GitHub Pages
  basePath: '/MD-to-PDF', // GitHub repo name for project pages
  assetPrefix: '/MD-to-PDF/', // Ensures assets load from correct path
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
