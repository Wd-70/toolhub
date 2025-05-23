"use client";

import React from "react";
import { usePomodoroContext } from "./PomodoroContext";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import Link from "next/link";

export function MiniTimerContainer() {
  const {
    mode,
    timeLeft,
    isActive,
    toggleTimer,
    formatTime,
    calculateProgress,
  } = usePomodoroContext();

  // 모드에 따른 색상 결정
  const modeColors = {
    work: "text-red-500 dark:text-red-400",
    break: "text-green-500 dark:text-green-400",
    longBreak: "text-blue-500 dark:text-blue-400",
  };

  const modeBackgrounds = {
    work: "bg-red-100 dark:bg-red-900/20",
    break: "bg-green-100 dark:bg-green-900/20",
    longBreak: "bg-blue-100 dark:bg-blue-900/20",
  };

  // 진행 상황 계산
  const progress = calculateProgress();

  // 모드 텍스트
  const modeText = {
    work: "작업 중",
    break: "휴식 중",
    longBreak: "긴 휴식 중",
  };

  return (
    <Link href="/tools/pomodoro" className="block">
      <div
        className={`p-3 rounded-lg ${modeBackgrounds[mode]} transition-colors duration-300`}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className={`text-xs font-medium ${modeColors[mode]}`}>
              {modeText[mode]}
            </div>
            <div className="text-base font-bold">{formatTime(timeLeft)}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // 링크 이동 방지
              toggleTimer();
            }}
            className={`p-1 h-8 w-8 rounded-full ${
              isActive
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-green-100 dark:bg-green-900/30"
            }`}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 진행 상태 표시 */}
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${modeColors[mode]} opacity-80`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );
}
