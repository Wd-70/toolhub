"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { usePomodoroContext } from "./PomodoroContext";

interface TimerDisplayProps {
  className?: string;
}

export function TimerDisplay({ className }: TimerDisplayProps) {
  const {
    mode,
    timeLeft,
    formatTime,
    calculateProgress,
    testMode,
    completedWorkSessions,
    workSessionsBeforeLongBreak,
  } = usePomodoroContext();

  // 모드에 따른 색상 설정
  const modeColors = {
    work: {
      bg: "bg-red-500",
      text: "text-red-500",
      border: "border-red-500",
      light: "bg-red-100 dark:bg-red-900/30",
      badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    break: {
      bg: "bg-green-500",
      text: "text-green-500",
      border: "border-green-500",
      light: "bg-green-100 dark:bg-green-900/30",
      badge:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    longBreak: {
      bg: "bg-blue-500",
      text: "text-blue-500",
      border: "border-blue-500",
      light: "bg-blue-100 dark:bg-blue-900/30",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
  };

  const currentColor = modeColors[mode];

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-6 ${className}`}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="text-lg font-medium">
            {mode === "work"
              ? "Work Time"
              : mode === "break"
              ? "Break Time"
              : "Long Break"}
          </h3>
          <Badge variant="outline" className={currentColor.badge}>
            {completedWorkSessions} / {workSessionsBeforeLongBreak}
          </Badge>
          {testMode && (
            <Badge
              variant="outline"
              className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
            >
              테스트 모드
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === "work"
            ? "Focus on your task"
            : mode === "break"
            ? "Take a short break"
            : "Take a long break"}
        </p>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={`${
                mode === "work"
                  ? "text-red-500"
                  : mode === "break"
                  ? "text-green-500"
                  : "text-blue-500"
              }`}
              strokeWidth="4"
              strokeDasharray={283}
              strokeDashoffset={283 - (283 * calculateProgress()) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
        </div>
        <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
}
