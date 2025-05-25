// 서비스 도메인 관련 상수
export const DOMAIN_CONFIG = {
  // 메인 도메인 - 모든 서브도메인의 기본이 됨
  MAIN_DOMAIN: "toolhub.services",

  // 프로토콜 (개발/프로덕션 환경에 따라 자동 설정)
  PROTOCOL: process.env.NODE_ENV === "production" ? "https" : "http",

  // 정적 자산 접두사 (CDN 등에서 사용)
  ASSET_PREFIX:
    process.env.NODE_ENV === "production" ? "https://toolhub.services" : "",

  // 전체 URL 생성 함수
  getMainUrl: function () {
    return `${this.PROTOCOL}://${this.MAIN_DOMAIN}`;
  },

  // 툴별 서브도메인 URL 생성
  getToolUrl: function (toolId: string) {
    return `/tools/${toolId}`;
  },

  // 정적 자산 URL 생성
  getAssetUrl: function (path: string) {
    return `${this.ASSET_PREFIX}${path}`;
  },

  // 툴 목록 (서브도메인 ID와 이름)
  TOOLS: [
    { id: "code-formatter", name: "코드 포맷터" },
    { id: "color-picker", name: "색상 선택기" },
    { id: "calculator", name: "계산기" },
    { id: "pomodoro", name: "뽀모도로 타이머" },
    { id: "markdown", name: "마크다운 에디터" },
    { id: "unit-converter", name: "단위 변환기" },
    { id: "random-picker", name: "랜덤 선택기" },
  ],
};

// 현재 실행 환경이 서브도메인인지 확인하는 함수
export function isSubdomain(hostname: string): boolean {
  // localhost는 항상 false 반환
  if (hostname === "localhost") return false;

  const mainDomain = DOMAIN_CONFIG.MAIN_DOMAIN;
  const regex = new RegExp(`^[^.]+\\.${mainDomain.replace(/\./g, "\\.")}$`);

  return regex.test(hostname);
}

// 현재 URL에서 서브도메인 추출
export function getSubdomainFromHostname(hostname: string): string | null {
  if (!isSubdomain(hostname)) return null;

  const parts = hostname.split(".");
  return parts[0];
}

// 앱 전역 설정
export const APP_CONFIG = {
  APP_NAME: "ToolHub",
  APP_DESCRIPTION: "다양한 웹 도구를 한 곳에서 편리하게 사용하세요.",
  COPYRIGHT: `© ${new Date().getFullYear()} ToolHub`,
};

// 사이드바 관련 설정 상수
export const SIDEBAR_WIDTH_OPTIONS = {
  small: "8rem", // 작은 크기 (128px)
  medium: "12rem", // 중간 크기 (192px)
  large: "16rem", // 큰 크기 (256px)
  extraLarge: "20rem", // 매우 큰 크기 (320px)
};

// 사이드바 너비 설정 함수 - localStorage에 저장하여 새로고침해도 유지
export const setSidebarWidth = (width: string) => {
  if (typeof window !== "undefined") {
    // localStorage에 저장
    localStorage.setItem("sidebar-width", width);

    // 실시간으로 CSS 변수 업데이트 (루트 요소)
    document.documentElement.style.setProperty("--sidebar-width", width);
    document.documentElement.style.setProperty("--sidebar-width-mobile", width);

    // 직접 DOM 요소에도 적용 (더 확실한 적용을 위해)
    try {
      // 모든 사이드바 요소에 직접 스타일 적용
      const sidebarElements = document.querySelectorAll("[data-sidebar]");
      sidebarElements.forEach((el) => {
        (el as HTMLElement).style.width = width;
      });

      // 사이드바 래퍼에도 직접 적용
      const wrapperElement = document.querySelector("[data-sidebar-wrapper]");
      if (wrapperElement) {
        (wrapperElement as HTMLElement).style.setProperty(
          "--sidebar-width",
          width
        );
      }

      // 모든 사이드바 그룹에도 직접 적용
      const groupElements = document.querySelectorAll('[data-sidebar="group"]');
      groupElements.forEach((el) => {
        (el as HTMLElement).style.width = "100%";
      });

      // 사이드바 컨텐츠에도 적용
      const contentElements = document.querySelectorAll(
        '[data-sidebar="content"]'
      );
      contentElements.forEach((el) => {
        (el as HTMLElement).style.width = "100%";
      });

      // Sidebar 컴포넌트에도 직접 적용
      const sidebarComponents = document.querySelectorAll(
        '.Sidebar, [class*="Sidebar"]'
      );
      sidebarComponents.forEach((el) => {
        (el as HTMLElement).style.width = width;
      });

      // 강제 리플로우 유도
      window.dispatchEvent(new Event("resize"));
    } catch (e) {
      console.error("사이드바 너비 적용 중 오류:", e);
    }
  }
};

// 사이드바 너비 가져오는 함수 - localStorage에서 읽어오거나 기본값 반환
export const getSidebarWidth = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("sidebar-width") || "12rem";
  }
  return "12rem";
};
