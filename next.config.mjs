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
    return [
      // 코드 포매터 서브도메인
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "code-formatter.yourdomain.com",
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
            value: "color-picker.yourdomain.com",
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
            value: "calculator.yourdomain.com",
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
            value: "pomodoro.yourdomain.com",
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
            value: "markdown.yourdomain.com",
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
            value: "converter.yourdomain.com",
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
            value: "random-picker.yourdomain.com",
          },
        ],
        destination: "/tools/random-picker/:path*",
      },
    ];
  },
};

export default nextConfig;
