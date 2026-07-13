let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the tracing root to this project so a stray lockfile in the home
  // directory doesn't make Next infer the wrong workspace root.
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  // Bake sample mode into every build so "Try Sample 0N1" (#922) always shows
  // on the live site without depending on a Vercel dashboard env toggle.
  // Set NEXT_PUBLIC_ENABLE_SAMPLE_MODE=false in the environment to disable.
  env: {
    NEXT_PUBLIC_ENABLE_SAMPLE_MODE:
      process.env.NEXT_PUBLIC_ENABLE_SAMPLE_MODE === "false" ? "false" : "true",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable optimization by default
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.opensea.io',
      },
      {
        protocol: 'https',
        hostname: '**.openseauserdata.com',
      },
      {
        protocol: 'https',
        hostname: '**.seadn.io',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.io',
      },
      {
        protocol: 'https',
        hostname: '**.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Security response headers applied to every route. The app previously
  // shipped none; this is the mitigating control for the Supabase session
  // token living in localStorage (no CSP existed to bound XSS blast radius).
  async headers() {
    // Pragmatic CSP: Next.js App Router needs 'unsafe-inline' styles and
    // inline/eval scripts (framework runtime + dev). connect-src is scoped to
    // Supabase (REST + Realtime websockets) and the OpenSea API; wallet
    // injection (window.ethereum) is same-origin JS so needs no extra origin.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.opensea.io",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
