import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export for GitHub Pages
  basePath: isProd ? '/MD-to-PDF' : '', // GitHub repo name for project pages (prod only)
  assetPrefix: isProd ? '/MD-to-PDF/' : '', // Ensures assets load from correct path (prod only)
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
