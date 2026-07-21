import type {NextConfig} from 'next';

// CSP notes: 'unsafe-inline'/'unsafe-eval' in script-src are required by
// Next.js inline bootstrap and the Google Maps loader until a nonce-based
// setup is introduced. connect-src covers Firebase Auth/Firestore/Storage/
// Functions; frame-src covers the Firebase Auth sign-in helper iframe.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://maps.googleapis.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://*.cloudfunctions.net https://maps.googleapis.com https://firebaseinstallations.googleapis.com https://firebase.googleapis.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Org logos include SVGs (e.g. the AKA crest). Safe-serving combo per
    // Next.js docs: attachment disposition + sandboxed CSP means an SVG can
    // render in <img> but never execute script if opened directly.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        hostname: 'oppf.org',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
