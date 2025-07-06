/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
      "gateway.pinata.cloud",
      "ipfs.io",
      "cloudflare-ipfs.com",
      "dweb.link",
      "nftstorage.link"
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Disable Next.js image optimization for IPFS
  },
  webpack: (config) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding"
    );
    return config;
  }
};

module.exports = nextConfig;
