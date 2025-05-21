"use client";

import React from "react";
import { usePomodoroContext } from "./PomodoroContext";

interface HistoryPanelProps {
  className?: string;
}

export function HistoryPanel({ className }: HistoryPanelProps) {
  const { sessions, formatTime } = usePomodoroContext();

  return (
    <div className={`h-[300px] overflow-y-auto ${className}`}>
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          세션 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                session.type === "work"
                  ? "bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900"
                  : session.type === "break"
                  ? "bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900"
                  : "bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {session.type === "work"
                    ? "작업 세션"
                    : session.type === "break"
                    ? "짧은 휴식"
                    : "긴 휴식"}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(session.duration)}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {session.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
