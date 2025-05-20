"use client";

import { notFound } from "next/navigation";
import CodeFormatter from "@/components/tools/code-formatter";
import ColorPicker from "@/components/tools/color-picker";
import Calculator from "@/components/tools/calculator";
import PomodoroTimer from "@/components/tools/pomodoro-timer";
import MarkdownEditor from "@/components/tools/markdown-editor";
import UnitConverter from "@/components/tools/unit-converter";
import RandomPicker from "@/components/tools/random-picker";
import { useParams } from "next/navigation";
import { useToolSidebar } from "../layout";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose } from "lucide-react";

// 클라이언트 컴포넌트로 변경하고 useParams 훅 사용
export default function ToolPage() {
  // 사이드바 컨텍스트 사용
  const { isOpen, toggle } = useToolSidebar();

  // useParams 훅으로 라우트 매개변수 가져오기
  const params = useParams();
  const toolId = params.toolId as string;

  const tools = {
    "code-formatter": {
      name: "Code Formatter",
      component: <CodeFormatter />,
      color: "bg-violet-50 dark:bg-violet-950",
      textColor: "text-violet-900 dark:text-violet-50",
      borderColor: "border-violet-200 dark:border-violet-800",
    },
    "color-picker": {
      name: "Color Picker",
      component: <ColorPicker />,
      color: "bg-pink-50 dark:bg-pink-950",
      textColor: "text-pink-900 dark:text-pink-50",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    calculator: {
      name: "Calculator",
      component: <Calculator />,
      color: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-900 dark:text-blue-50",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    pomodoro: {
      name: "Pomodoro Timer",
      component: <PomodoroTimer />,
      color: "bg-red-50 dark:bg-red-950",
      textColor: "text-red-900 dark:text-red-50",
      borderColor: "border-red-200 dark:border-red-800",
    },
    markdown: {
      name: "Markdown Editor",
      component: <MarkdownEditor />,
      color: "bg-emerald-50 dark:bg-emerald-950",
      textColor: "text-emerald-900 dark:text-emerald-50",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    converter: {
      name: "Unit Converter",
      component: <UnitConverter />,
      color: "bg-amber-50 dark:bg-amber-950",
      textColor: "text-amber-900 dark:text-amber-50",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    "random-picker": {
      name: "Random Picker",
      component: <RandomPicker />,
      color: "bg-purple-50 dark:bg-purple-950",
      textColor: "text-purple-900 dark:text-purple-50",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  } as const;

  const tool = tools[toolId as keyof typeof tools];

  if (!tool) {
    notFound();
  }

  return (
    <div className={`min-h-screen ${tool.color}`}>
      <header
        className={`sticky top-0 z-10 w-full border-b ${tool.borderColor} backdrop-blur supports-[backdrop-filter]:bg-background/60`}
      >
        <div className="px-4 py-3 md:py-4 flex items-center">
          {/* 모바일 메뉴 버튼을 위한 공간 */}
          <div className="w-8 md:hidden"></div>

          {/* 사이드바 토글 버튼 (데스크탑에서만 표시) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="hidden md:flex mr-2"
            title={isOpen ? "사이드바 닫기" : "사이드바 열기"}
          >
            {isOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <h1
            className={`text-xl font-bold ${tool.textColor} ml-8 md:ml-0 text-center md:text-left flex-1`}
          >
            {tool.name}
          </h1>
        </div>
      </header>
      <main className="p-4 md:p-6">{tool.component}</main>
      <footer className={`w-full border-t ${tool.borderColor} py-3 px-4`}>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} ToolHub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
