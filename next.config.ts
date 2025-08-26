import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // TypeScript and ESLint checks re-enabled for better code quality and security
  // Note: Some existing issues may need to be addressed over time
  typescript: {
    // ignoreBuildErrors: true, // Re-enabled for security and code quality
  },
  eslint: {
    // ignoreDuringBuilds: true, // Re-enabled for security and code quality
    // Allow builds to continue with warnings but show errors
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.nphchq.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aka1908.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'apa1906.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.deltasigmatheta.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'iotaphitheta.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pngall.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'studentlife.oregonstate.edu',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
