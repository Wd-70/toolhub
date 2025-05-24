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
