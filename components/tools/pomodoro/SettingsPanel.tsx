"use client";

import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePomodoroContext } from "./PomodoroContext";

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    handleWorkDurationChange,
    handleBreakDurationChange,
    handleLongBreakDurationChange,
    workSessionsBeforeLongBreak,
    handleWorkSessionsBeforeLongBreakChange,
    dailyGoal,
    handleDailyGoalChange,
    autoStartNextSession,
    setAutoStartNextSession,
    showNotification,
    setShowNotification,
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    isActive,
    mode,
    setTimeLeft,
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setWorkSessionsBeforeLongBreak,
  } = usePomodoroContext();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="work-duration">작업 시간 (분)</Label>
        <Input
          id="work-duration"
          type="number"
          min="1"
          value={workDuration}
          onChange={handleWorkDurationChange}
          disabled={isActive}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="break-duration">짧은 휴식 시간 (분)</Label>
        <Input
          id="break-duration"
          type="number"
          min="1"
          value={breakDuration}
          onChange={handleBreakDurationChange}
          disabled={isActive}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="long-break-duration">긴 휴식 시간 (분)</Label>
        <Input
          id="long-break-duration"
          type="number"
          min="1"
          value={longBreakDuration}
          onChange={handleLongBreakDurationChange}
          disabled={isActive}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sessions-before-long-break">
          긴 휴식 전 작업 세션 수
        </Label>
        <Select
          value={workSessionsBeforeLongBreak.toString()}
          onValueChange={handleWorkSessionsBeforeLongBreakChange}
          disabled={isActive}
        >
          <SelectTrigger id="sessions-before-long-break">
            <SelectValue placeholder="세션 수 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 세션</SelectItem>
            <SelectItem value="3">3 세션</SelectItem>
            <SelectItem value="4">4 세션</SelectItem>
            <SelectItem value="5">5 세션</SelectItem>
            <SelectItem value="6">6 세션</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="daily-goal">일일 목표 세션 수</Label>
        <Input
          id="daily-goal"
          type="number"
          min="1"
          value={dailyGoal}
          onChange={handleDailyGoalChange}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="auto-start" className="cursor-pointer">
          세션 완료 후 자동 시작
        </Label>
        <Switch
          id="auto-start"
          checked={autoStartNextSession}
          onCheckedChange={setAutoStartNextSession}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="show-notification" className="cursor-pointer">
          브라우저 알림 표시
        </Label>
        <Switch
          id="show-notification"
          checked={showNotification}
          onCheckedChange={setShowNotification}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="sound-enabled" className="cursor-pointer">
          알림음 재생
        </Label>
        <div className="flex items-center gap-2">
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
          {soundEnabled && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              // 실제 기능 제거됨
            >
              테스트
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Label htmlFor="sound-volume" className="flex justify-between">
          <span>알림음 볼륨</span>
          <span>{Math.round(volume * 100)}%</span>
        </Label>
        <Slider
          id="sound-volume"
          min={0}
          max={1}
          step={0.01}
          value={[volume]}
          onValueChange={(value) => {
            setVolume(value[0]);
            // 볼륨 변경 기능 제거됨
          }}
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setWorkDuration(25);
            setBreakDuration(5);
            setLongBreakDuration(15);
            setWorkSessionsBeforeLongBreak(4);
            setAutoStartNextSession(true);
            if (!isActive) {
              setTimeLeft(
                mode === "work" ? 25 * 60 : mode === "break" ? 5 * 60 : 15 * 60
              );
            }
          }}
          disabled={isActive}
        >
          <Settings className="h-4 w-4 mr-2" />
          기본값으로 재설정
        </Button>
      </div>
    </div>
  );
}
