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

// 도구 카테고리 정의 - ToolSidebar.tsx와 동일한 데이터
const toolCategories = [
  {
    id: "time",
    label: "시간 관리",
    tools: [
      {
        id: "pomodoro",
        name: "포모도로 타이머",
        icon: <Clock className="h-5 w-5 text-red-500" />,
        href: "https://pomodoro.toolhub.services",
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
        href: "https://markdown.toolhub.services",
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
        href: "https://code-formatter.toolhub.services",
      },
      {
        id: "color-picker",
        name: "색상 선택기",
        icon: <Palette className="h-5 w-5 text-pink-500" />,
        href: "https://color-picker.toolhub.services",
      },
      {
        id: "calculator",
        name: "계산기",
        icon: <Calculator className="h-5 w-5 text-blue-500" />,
        href: "https://calculator.toolhub.services",
      },
      {
        id: "unit-converter",
        name: "단위 변환기",
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        href: "https://unit-converter.toolhub.services",
      },
      {
        id: "random-picker",
        name: "랜덤 선택기",
        icon: <Shuffle className="h-5 w-5 text-purple-500" />,
        href: "https://random-picker.toolhub.services",
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
    const currentTool = allTools.find((tool) => currentPath === tool.href);
    return currentTool?.id;
  };

  const currentToolId = getCurrentToolId();

  return (
    <div className="flex flex-col h-full pt-4 pb-6 bg-background">
      {/* 헤더 */}
      <div className="px-6 py-2 mb-4">
        <Link href="/" className="flex items-center space-x-2">
          <LayoutGrid className="h-6 w-6" />
          <span className="font-semibold text-xl">ToolHub</span>
        </Link>
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
                  <Link
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
                  </Link>
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
          &copy; {new Date().getFullYear()} ToolHub
        </div>
      </div>
    </div>
  );
}
