import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Suppress webpack warnings from optional genkit dependencies
  webpack: (config: { ignoreWarnings: any[]; }, { isServer }: any) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@opentelemetry\/instrumentation/,
        message: /Critical dependency/,
      },
      {
        module: /@opentelemetry\/sdk-node/,
        message: /Can't resolve '@opentelemetry\/exporter-jaeger'/,
      },
      {
        module: /@genkit-ai\/core/,
        message: /Can't resolve '@genkit-ai\/firebase'/,
      },
      {
        module: /handlebars/,
        message: /require\.extensions/,
      },
    ];

    return config;
  },
};

export default nextConfig;
