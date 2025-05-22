"use client";

import React from "react";
import { usePomodoroContext } from "./PomodoroContext";

interface SessionIndicatorProps {
  className?: string;
}

export function SessionIndicator({ className }: SessionIndicatorProps) {
  const { workSessionsBeforeLongBreak, currentSessionNumber } =
    usePomodoroContext();

  // 현재 세션 번호를 기준으로 동그라미 표시 (1부터 시작)
  // 현재 세션 번호를 워크세션 길이로 나눈 나머지를 계산 (0이면 워크세션 길이 사용)
  const activeCircles =
    currentSessionNumber % workSessionsBeforeLongBreak ||
    workSessionsBeforeLongBreak;

  return (
    <div className={`w-full flex justify-center gap-1 ${className}`}>
      {Array.from({ length: workSessionsBeforeLongBreak }).map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full ${
            index < activeCircles
              ? "bg-red-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}
