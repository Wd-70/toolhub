"use client";

import React from "react";
import { Clock, Zap } from "lucide-react";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { usePomodoroContext } from "./PomodoroContext";

interface TimerHeaderProps {
  className?: string;
}

export function TimerHeader({ className }: TimerHeaderProps) {
  const { testMode, showTestControls, setShowTestControls } =
    usePomodoroContext();

  return (
    <CardHeader
      className={`bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-red-500" />
          <CardTitle>Pomodoro Timer</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 ${
                    testMode
                      ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                      : ""
                  }`}
                  onClick={() => setShowTestControls(!showTestControls)}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  테스트 모드
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>타이머를 빠르게 테스트하기 위한 모드입니다.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <CardDescription>
        집중력 향상을 위한 포모도로 타이머입니다.
      </CardDescription>
    </CardHeader>
  );
}
