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
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// 도구 카테고리 정의
const toolCategories = [
  {
    id: "time",
    label: "시간 관리",
    tools: [
      {
        id: "pomodoro",
        name: "포모도로 타이머",
        icon: <Clock className="h-4 w-4 text-red-500" />,
        href: "/tools/pomodoro",
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
        icon: <FileText className="h-4 w-4 text-emerald-500" />,
        href: "/tools/markdown",
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
        icon: <Code className="h-4 w-4 text-violet-500" />,
        href: "/tools/code-formatter",
      },
      {
        id: "color-picker",
        name: "색상 선택기",
        icon: <Palette className="h-4 w-4 text-pink-500" />,
        href: "/tools/color-picker",
      },
      {
        id: "calculator",
        name: "계산기",
        icon: <Calculator className="h-4 w-4 text-blue-500" />,
        href: "/tools/calculator",
      },
      {
        id: "converter",
        name: "단위 변환기",
        icon: <Zap className="h-4 w-4 text-amber-500" />,
        href: "/tools/converter",
      },
      {
        id: "random-picker",
        name: "랜덤 선택기",
        icon: <Shuffle className="h-4 w-4 text-purple-500" />,
        href: "/tools/random-picker",
      },
    ],
  },
];

// 모든 도구를 단일 배열로 펼친 목록
const allTools = toolCategories.flatMap((category) => category.tools);

export function ToolSidebar() {
  const pathname = usePathname();

  // 현재 활성화된 도구 ID 찾기
  const getCurrentToolId = () => {
    const currentPath = pathname;
    const currentTool = allTools.find((tool) => currentPath === tool.href);
    return currentTool?.id;
  };

  const currentToolId = getCurrentToolId();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarRail />
        <SidebarHeader className="h-14">
          <div className="flex items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-2">
              <LayoutGrid className="h-5 w-5" />
              <span className="font-semibold text-lg">ToolHub</span>
            </Link>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {toolCategories.map((category) => (
            <SidebarGroup key={category.id}>
              <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {category.tools.map((tool) => (
                    <SidebarMenuItem key={tool.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentToolId === tool.id}
                      >
                        <Link href={tool.href}>
                          {tool.icon}
                          <span>{tool.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="space-y-2">
            <Separator />
            <Button variant="outline" size="sm" className="w-full">
              <ChevronLeft className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
