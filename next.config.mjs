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
  async redirects() {
    return [
      // 서브도메인에 접속시 해당 툴 페이지로 리디렉션
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "code-formatter.toolhub.services",
          },
        ],
        destination: "/tools/code-formatter",
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "color-picker.toolhub.services",
          },
        ],
        destination: "/tools/color-picker",
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "calculator.toolhub.services",
          },
        ],
        destination: "/tools/calculator",
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "pomodoro.toolhub.services",
          },
        ],
        destination: "/tools/pomodoro",
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "markdown.toolhub.services",
          },
        ],
        destination: "/tools/markdown",
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "converter.toolhub.services",
          },
        ],
        destination: "/tools/converter",
        permanent: false,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "random-picker.toolhub.services",
          },
        ],
        destination: "/tools/random-picker",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      // 코드 포매터 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "code-formatter.toolhub.services",
          },
        ],
        destination: "/tools/code-formatter/:path*",
      },
      // 색상 피커 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "color-picker.toolhub.services",
          },
        ],
        destination: "/tools/color-picker/:path*",
      },
      // 계산기 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "calculator.toolhub.services",
          },
        ],
        destination: "/tools/calculator/:path*",
      },
      // 포모도로 타이머 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "pomodoro.toolhub.services",
          },
        ],
        destination: "/tools/pomodoro/:path*",
      },
      // 마크다운 에디터 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "markdown.toolhub.services",
          },
        ],
        destination: "/tools/markdown/:path*",
      },
      // 단위 변환기 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "converter.toolhub.services",
          },
        ],
        destination: "/tools/converter/:path*",
      },
      // 랜덤 선택기 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "random-picker.toolhub.services",
          },
        ],
        destination: "/tools/random-picker/:path*",
      },
    ];
  },
};

export default nextConfig;
