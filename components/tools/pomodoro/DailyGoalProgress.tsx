"use client";

import React from "react";
import { usePomodoroContext } from "./PomodoroContext";

interface DailyGoalProgressProps {
  className?: string;
}

export function DailyGoalProgress({ className }: DailyGoalProgressProps) {
  const { todayCompletedSessions, dailyGoal } = usePomodoroContext();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>오늘의 목표</span>
        <span>
          {todayCompletedSessions} / {dailyGoal} 세션
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-red-500 h-2 rounded-full"
          style={{
            width: `${Math.min(
              100,
              (todayCompletedSessions / dailyGoal) * 100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}
