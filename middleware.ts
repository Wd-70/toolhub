import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 응답 객체 생성
  const response = NextResponse.next();

  // CORS 헤더 추가
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization"
  );

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
