/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 서브도메인에서도 정적 자산을 로드할 수 있도록 assetPrefix 설정
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://toolhub.services"
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
            value: "*.toolhub.services",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
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
    ];
  },
  // rewrites와 redirects를 더 간결하게 정리
  async rewrites() {
    return {
      beforeFiles: [
        // 서브도메인 접속 시 해당 툴 페이지로 내부 라우팅
        {
          source: "/:path*",
          has: [{ type: "host", value: "code-formatter.toolhub.services" }],
          destination: "/tools/code-formatter/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "color-picker.toolhub.services" }],
          destination: "/tools/color-picker/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "calculator.toolhub.services" }],
          destination: "/tools/calculator/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "pomodoro.toolhub.services" }],
          destination: "/tools/pomodoro/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "markdown.toolhub.services" }],
          destination: "/tools/markdown/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "unit-converter.toolhub.services" }],
          destination: "/tools/unit-converter/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "random-picker.toolhub.services" }],
          destination: "/tools/random-picker/:path*",
        },
      ],
    };
  },
  // 리디렉션 설정 (이미 적용되어 잘 작동 중)
  async redirects() {
    return [
      // 도구 하위 경로로 직접 접근 시 해당 서브도메인으로 리디렉션
      {
        source: "/tools/code-formatter",
        destination: "https://code-formatter.toolhub.services",
        permanent: false,
      },
      {
        source: "/tools/color-picker",
        destination: "https://color-picker.toolhub.services",
        permanent: false,
      },
      {
        source: "/tools/calculator",
        destination: "https://calculator.toolhub.services",
        permanent: false,
      },
      {
        source: "/tools/pomodoro",
        destination: "https://pomodoro.toolhub.services",
        permanent: false,
      },
      {
        source: "/tools/markdown",
        destination: "https://markdown.toolhub.services",
        permanent: false,
      },
      {
        source: "/tools/unit-converter",
        destination: "https://unit-converter.toolhub.services",
        permanent: false,
      },
      {
        source: "/tools/random-picker",
        destination: "https://random-picker.toolhub.services",
        permanent: false,
      },

      // 서브도메인 내에서 /tools 경로로 접근 시 루트로 리디렉션하여 이중 경로 방지
      {
        source: "/tools/:toolId",
        has: [
          {
            type: "host",
            value: ":subdomain.toolhub.services",
          },
        ],
        destination: "https://:subdomain.toolhub.services",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
