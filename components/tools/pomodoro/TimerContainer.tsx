"use client";

import React from "react";
import { CardContent, CardFooter, Card } from "@/components/ui/card";
import { TimerHeader } from "./TimerHeader";
import { TestModeControls } from "./TestModeControls";
import { TimerTabs } from "./TimerTabs";
import { usePomodoroContext } from "./PomodoroContext";

interface TimerContainerProps {
  className?: string;
}

export function TimerContainer({ className }: TimerContainerProps) {
  const { mode, testMode } = usePomodoroContext();

  return (
    <Card
      className={`w-full bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 ${className}`}
    >
      <TimerHeader />
      <CardContent className="p-6">
        <TestModeControls />
        <TimerTabs />
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6">
        <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
          {mode === "work" ? (
            <p>집중 모드: 작업에 집중하세요!</p>
          ) : mode === "break" ? (
            <p>짧은 휴식 모드: 잠시 휴식을 취하세요.</p>
          ) : (
            <p>긴 휴식 모드: 충분한 휴식을 취하세요.</p>
          )}
          {testMode && (
            <p className="text-amber-500 dark:text-amber-400 mt-1">
              테스트 모드가 활성화되었습니다.
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
