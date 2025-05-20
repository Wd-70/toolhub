"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolSidebar } from "@/components/layout/ToolSidebar";
import { MobileToolSidebar } from "@/components/layout/MobileToolSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";

// 사이드바 상태를 위한 컨텍스트 생성
export const ToolSidebarContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
}>({
  isOpen: true,
  toggle: () => {},
});

// 사이드바 컨텍스트 훅
export const useToolSidebar = () => useContext(ToolSidebarContext);

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // sidebarRef를 통해 UI 라이브러리의 사이드바에 접근할 수 있게 합니다
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 사이드바 토글 함수
  const toggle = () => {
    setIsOpen((prev) => !prev);

    // 사이드바 트리거 버튼 클릭 시뮬레이션
    if (sidebarRef.current) {
      const triggerButton = sidebarRef.current.querySelector("[data-trigger]");
      if (triggerButton && triggerButton instanceof HTMLElement) {
        triggerButton.click();
      }
    }
  };

  // 초기 렌더링 후 한 번 실행
  useEffect(() => {
    // 쿠키에서 사이드바 상태를 읽어와 동기화
    const cookies = document.cookie.split(";");
    const sidebarCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("sidebar:state=")
    );

    if (sidebarCookie) {
      const sidebarState = sidebarCookie.split("=")[1];
      setIsOpen(sidebarState === "true");
    }
  }, []);

  return (
    <ToolSidebarContext.Provider value={{ isOpen, toggle }}>
      <SidebarProvider defaultOpen={isOpen} open={isOpen}>
        <div className="flex h-screen w-full bg-background" ref={sidebarRef}>
          {/* 데스크탑 사이드바 */}
          <div className={`hidden md:block`}>
            <ToolSidebar />
          </div>

          {/* 모바일 사이드바 */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              asChild
              className="absolute top-0 left-0 z-50 md:hidden"
            >
              <div className="p-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-full max-w-[280px] overflow-y-auto"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>툴허브 사이드바</SheetTitle>
                <SheetDescription>
                  사용 가능한 도구 목록을 탐색하세요
                </SheetDescription>
              </SheetHeader>
              <div className="h-full flex flex-col">
                <MobileToolSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </SidebarProvider>
    </ToolSidebarContext.Provider>
  );
}
