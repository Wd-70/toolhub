"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code,
  Palette,
  Calculator,
  Clock,
  FileText,
  Zap,
  Shuffle,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DOMAIN_CONFIG, APP_CONFIG } from "@/lib/constants";

// 도구 카테고리 정의 - 중앙화된 도메인 설정 사용
const toolCategories = [
  {
    id: "time",
    label: "시간 관리",
    tools: [
      {
        id: "pomodoro",
        name: "포모도로 타이머",
        icon: <Clock className="h-5 w-5 text-red-500" />,
        href: DOMAIN_CONFIG.getToolUrl("pomodoro"),
      },
    ],
  },
  {
    id: "productivity",
    label: "생산성",
    tools: [
      {
        id: "markdown",
        name: "마크다운 에디터",
        icon: <FileText className="h-5 w-5 text-emerald-500" />,
        href: DOMAIN_CONFIG.getToolUrl("markdown"),
      },
    ],
  },
  {
    id: "utilities",
    label: "유틸리티",
    tools: [
      {
        id: "code-formatter",
        name: "코드 포매터",
        icon: <Code className="h-5 w-5 text-violet-500" />,
        href: DOMAIN_CONFIG.getToolUrl("code-formatter"),
      },
      {
        id: "color-picker",
        name: "색상 선택기",
        icon: <Palette className="h-5 w-5 text-pink-500" />,
        href: DOMAIN_CONFIG.getToolUrl("color-picker"),
      },
      {
        id: "calculator",
        name: "계산기",
        icon: <Calculator className="h-5 w-5 text-blue-500" />,
        href: DOMAIN_CONFIG.getToolUrl("calculator"),
      },
      {
        id: "unit-converter",
        name: "단위 변환기",
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        href: DOMAIN_CONFIG.getToolUrl("unit-converter"),
      },
      {
        id: "random-picker",
        name: "랜덤 선택기",
        icon: <Shuffle className="h-5 w-5 text-purple-500" />,
        href: DOMAIN_CONFIG.getToolUrl("random-picker"),
      },
    ],
  },
];

// 모든 도구를 단일 배열로 펼친 목록
const allTools = toolCategories.flatMap((category) => category.tools);

export function MobileToolSidebar() {
  const pathname = usePathname();

  // 현재 활성화된 도구 ID 찾기
  const getCurrentToolId = () => {
    const currentPath = pathname;
    const currentTool = allTools.find((tool) => currentPath.includes(tool.id));
    return currentTool?.id;
  };

  // 홈으로 이동하는 함수
  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = DOMAIN_CONFIG.getMainUrl();
  };

  const currentToolId = getCurrentToolId();

  return (
    <div className="flex flex-col h-full pt-4 pb-6 bg-background">
      {/* 헤더 */}
      <div className="px-6 py-2 mb-4">
        <a
          href={DOMAIN_CONFIG.getMainUrl()}
          className="flex items-center space-x-2 cursor-pointer"
          onClick={navigateToHome}
        >
          <LayoutGrid className="h-6 w-6" />
          <span className="font-semibold text-xl">{APP_CONFIG.APP_NAME}</span>
        </a>
      </div>

      {/* 카테고리 및 도구 목록 */}
      <div className="flex-1 overflow-y-auto px-3">
        {toolCategories.map((category) => (
          <div key={category.id} className="mb-6">
            <h3 className="px-3 text-sm font-medium text-muted-foreground mb-2">
              {category.label}
            </h3>
            <div className="space-y-1">
              {category.tools.map((tool) => {
                const isActive = currentToolId === tool.id;
                return (
                  <a
                    key={tool.id}
                    href={tool.href}
                    className={`flex items-center px-3 py-3.5 rounded-md text-sm font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <div className="mr-3 shrink-0">{tool.icon}</div>
                    <span>{tool.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 */}
      <div className="px-6 mt-auto">
        <Separator className="mb-4" />
        <div className="text-xs text-muted-foreground">
          {APP_CONFIG.COPYRIGHT}
        </div>
      </div>
    </div>
  );
}
