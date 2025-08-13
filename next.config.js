/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: { unoptimized: true },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
      };
    }

    // Silence harmless dynamic require warning from @whatwg-node/fetch
    config.ignoreWarnings = [
      { module: /@whatwg-node\/fetch/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
