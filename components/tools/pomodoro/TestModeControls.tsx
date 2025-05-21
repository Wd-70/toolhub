"use client";

import React from "react";
import { AlertCircle, FastForward } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { usePomodoroContext } from "./PomodoroContext";

interface TestModeControlsProps {
  className?: string;
}

export function TestModeControls({ className }: TestModeControlsProps) {
  const {
    testMode,
    testDuration,
    showTestControls,
    isActive,
    toggleTestMode,
    handleTestDurationChange,
    fastForwardTimer,
  } = usePomodoroContext();

  if (!showTestControls) return null;

  return (
    <div
      className={`mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300">
          테스트 모드 설정
        </h3>
        <Switch checked={testMode} onCheckedChange={toggleTestMode} />
      </div>

      {testMode && (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="test-duration" className="text-xs">
                테스트 타이머 시간 (초)
              </Label>
              <Input
                id="test-duration"
                type="number"
                min="1"
                value={testDuration}
                onChange={handleTestDurationChange}
                className="h-8"
                disabled={isActive}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={fastForwardTimer}
                    disabled={!isActive}
                  >
                    <FastForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>타이머를 5초로 빨리감기</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3 w-3 inline-block mr-1" />
            테스트 모드에서는 모든 타이머가 {testDuration}초로 설정됩니다.
          </div>
        </div>
      )}
    </div>
  );
}
