import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  images: {
    // Allow local images with query strings
    localPatterns: [
      {
        // Use pathname with a glob-style pattern
        pathname: '/card*', // matches /card and /card?user=anything
      },
    ],
  },
};

export default nextConfig;
