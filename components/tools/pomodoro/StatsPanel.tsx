"use client";

import React from "react";
import { usePomodoroContext } from "./PomodoroContext";

interface StatsPanelProps {
  className?: string;
}

export function StatsPanel({ className }: StatsPanelProps) {
  const {
    todayCompletedSessions,
    workDuration,
    dailyGoal,
    completedWorkSessions,
    workSessionsBeforeLongBreak,
  } = usePomodoroContext();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">오늘의 통계</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              완료한 작업 세션
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {todayCompletedSessions}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              집중 시간
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {Math.floor((todayCompletedSessions * workDuration) / 60)}
              시간 {(todayCompletedSessions * workDuration) % 60}분
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">목표 달성률</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>일일 목표</span>
            <span>
              {Math.min(
                100,
                Math.round((todayCompletedSessions / dailyGoal) * 100)
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (todayCompletedSessions / dailyGoal) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">현재 세션</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">작업 세션 카운트</span>
            <span className="text-sm font-medium">
              {completedWorkSessions % workSessionsBeforeLongBreak} /{" "}
              {workSessionsBeforeLongBreak}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">다음 긴 휴식까지</span>
            <span className="text-sm font-medium">
              {workSessionsBeforeLongBreak -
                (completedWorkSessions % workSessionsBeforeLongBreak)}{" "}
              세션
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
