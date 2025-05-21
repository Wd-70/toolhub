"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePomodoroContext } from "./PomodoroContext";

interface TimerControlsProps {
  className?: string;
}

export function TimerControls({ className }: TimerControlsProps) {
  const {
    isActive,
    soundEnabled,
    toggleTimer,
    resetTimer,
    setSoundEnabled,
    testMode,
    fastForwardTimer,
  } = usePomodoroContext();

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTimer}
        className={`h-10 w-10 ${
          isActive
            ? "bg-red-50 dark:bg-red-950/20"
            : "bg-green-50 dark:bg-green-950/20"
        }`}
      >
        {isActive ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={resetTimer}
        className="h-10 w-10"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="h-10 w-10"
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
      {testMode && isActive && (
        <Button
          variant="outline"
          size="icon"
          onClick={fastForwardTimer}
          className="h-10 w-10 bg-amber-50 dark:bg-amber-950/20"
        >
          <FastForward className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
