import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SDK_ROOT = path.resolve(__dirname, 'vendor/fs_trading_sdk/packages');

const FS_API = process.env.NEXT_PUBLIC_FUNCTIONSPACE_API_URL;
if (!FS_API) {
  throw new Error('NEXT_PUBLIC_FUNCTIONSPACE_API_URL must be set in .env');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@functionspace/core',
    '@functionspace/react',
    '@functionspace/ui',
  ],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // SDK source is consumed in place; its types are validated in its own project.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Proxy any /api/* path NOT handled by our own route files to the
  // functionSPACE backend. Our routes (/api/auth/login, /api/teams/*,
  // /api/trades) take precedence (afterFiles is the default). This makes
  // the browser-side SDK fetches same-origin, avoiding CORS.
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${FS_API}/api/:path*` },
    ];
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@functionspace/core': path.join(SDK_ROOT, 'core/src/index.ts'),
      '@functionspace/react': path.join(SDK_ROOT, 'react/src/index.ts'),
      '@functionspace/ui': path.join(SDK_ROOT, 'ui/src/index.ts'),
    };
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      ...(config.resolve.modules ?? ['node_modules']),
    ];
    return config;
  },
};

export default nextConfig;
