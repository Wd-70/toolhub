/** @type {import('next').NextConfig} */

// 도메인 설정
const MAIN_DOMAIN = "toolhub.services";
const TOOLS = [
  "code-formatter",
  "color-picker",
  "calculator",
  "pomodoro",
  "markdown",
  "unit-converter",
  "random-picker",
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [MAIN_DOMAIN],
  },
  // 서브도메인에서도 정적 자산을 로드할 수 있도록 assetPrefix 설정
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? `https://${MAIN_DOMAIN}`
      : undefined,
  // CORS 설정을 위한 헤더 추가
  async headers() {
    return [
      {
        // 모든 경로에 적용
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
      {
        // 정적 파일 경로에 대한 특별 설정
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 웹 폰트에 대한 특별 설정
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // rewrites와 redirects를 더 간결하게 정리
  async rewrites() {
    // 동적으로 rewrites 규칙 생성
    const toolRewrites = TOOLS.map((tool) => ({
      source: "/:path*",
      has: [{ type: "host", value: `${tool}.${MAIN_DOMAIN}` }],
      destination: `/tools/${tool}/:path*`,
    }));

    return {
      beforeFiles: toolRewrites,
    };
  },
  // 리디렉션 설정 개선
  async redirects() {
    // 동적으로 redirects 규칙 생성
    const toolRedirects = TOOLS.map((tool) => ({
      source: `/tools/${tool}`,
      destination: `https://${tool}.${MAIN_DOMAIN}`,
      permanent: false,
    }));

    // 서브도메인 내에서 /tools 경로로 접근 시 루트로 리디렉션
    const subdomainRedirect = {
      source: "/tools/:toolId",
      has: [
        {
          type: "host",
          value: `:subdomain.${MAIN_DOMAIN}`,
        },
      ],
      destination: `https://:subdomain.${MAIN_DOMAIN}`,
      permanent: false,
    };

    return [...toolRedirects, subdomainRedirect];
  },
};

export default nextConfig;
