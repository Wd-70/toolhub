"use client";

import React from "react";
import { usePomodoroContext } from "./PomodoroContext";

interface SessionIndicatorProps {
  className?: string;
}

export function SessionIndicator({ className }: SessionIndicatorProps) {
  const { workSessionsBeforeLongBreak, completedWorkSessions } =
    usePomodoroContext();

  return (
    <div className={`w-full flex justify-center gap-1 ${className}`}>
      {Array.from({ length: workSessionsBeforeLongBreak }).map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full ${
            index <
            (completedWorkSessions % workSessionsBeforeLongBreak ||
              workSessionsBeforeLongBreak)
              ? "bg-red-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}
