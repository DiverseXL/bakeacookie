import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack tweaks required for @solana/web3.js and @coral-xyz/anchor
  // to work in the browser (Node.js built-ins that aren't available)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: require.resolve("buffer/"),
      };
    }
    return config;
  },
};

export default nextConfig;
