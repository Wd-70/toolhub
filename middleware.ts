import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 요청 경로 확인
  const { pathname } = request.nextUrl;
  const isFontRequest =
    pathname.includes("/_next/static/media") &&
    (pathname.endsWith(".woff2") ||
      pathname.endsWith(".woff") ||
      pathname.endsWith(".ttf") ||
      pathname.endsWith(".otf"));

  // 응답 객체 생성
  const response = NextResponse.next();

  // 기본 CORS 헤더 추가
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization"
  );

  // 웹 폰트에 대한 특별 CORS 헤더 추가
  if (isFontRequest) {
    // 폰트 파일에 대해 모든 도메인에서 접근 허용
    response.headers.set("Access-Control-Allow-Origin", "*");
    // 캐시 정책 설정
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    // 폰트 유형 지정
    response.headers.set(
      "Content-Type",
      pathname.endsWith(".woff2")
        ? "font/woff2"
        : pathname.endsWith(".woff")
        ? "font/woff"
        : "font/ttf"
    );
  }

  // OPTIONS 요청(preflight)에 대한 처리
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

// 미들웨어를 적용할 경로 패턴 지정
export const config = {
  matcher: [
    // 모든 경로에 적용
    "/(.*)",
    // 정적 파일에도 적용
    "/_next/static/:path*",
    "/_next/image/:path*",
    // 미디어 파일(폰트 등)에 적용
    "/_next/static/media/:path*",
  ],
};
