"use client";

import React, { createContext, useContext } from "react";
import { useTimer } from "./hooks/useTimer";
import { useNotification } from "./hooks/useNotification";
import { useSettings } from "./hooks/useSettings";
import { useStats } from "./hooks/useStats";
import { PomodoroContextType } from "./types";

export { type TimerMode, type SessionData } from "./types";

export const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error(
      "usePomodoroContext must be used within a PomodoroProvider"
    );
  }
  return context;
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 설정 관련 훅
  const settings = useSettings();

  // 통계 관련 훅
  const stats = useStats();

  // 알림 관련 훅
  const notifications = useNotification();

  // 타이머 관련 훅
  const timer = useTimer({
    onSessionComplete: (mode, duration) => {
      // 세션 완료 시 알림 발송
      const title = mode === "work" ? "작업 시간 완료!" : "휴식 시간 완료!";
      const body =
        mode === "work" ? "휴식 시간을 가지세요." : "다시 작업할 시간입니다.";

      // 알림 발송
      notifications.sendNotification({
        title,
        body,
        requireInteraction: true,
      });

      // 작업 세션인 경우 통계에 추가
      if (mode === "work") {
        stats.addSession({
          type: mode,
          duration,
          timestamp: new Date(),
        });
      }
    },
  });

  // 이벤트 핸들러
  const handleDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      stats.setDailyGoal(value);
    }
  };

  const contextValue: PomodoroContextType = {
    // 타이머 상태
    mode: timer.mode,
    timeLeft: timer.timeLeft,
    isActive: timer.isActive,
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
    workSessionsBeforeLongBreak: settings.workSessionsBeforeLongBreak,
    completedWorkSessions: timer.completedWorkSessions,
    currentSessionNumber: timer.currentSessionNumber,
    todayCompletedSessions: stats.todayCompletedSessions,
    sessions: timer.sessions,
    dailyGoal: stats.dailyGoal,

    // 설정
    soundEnabled: notifications.soundEnabled,
    volume: notifications.volume,
    autoStartNextSession: timer.autoStartNextSession,
    showNotification: notifications.showNotification,
    notificationPermission: notifications.notificationPermission,

    // 테스트 모드
    testMode: timer.testMode,
    testDuration: timer.testDuration,
    showTestControls: settings.showTestControls,

    // 전역 모드 설정
    globalModeEnabled: settings.globalModeEnabled,
    setGlobalModeEnabled: settings.setGlobalModeEnabled,

    // 타이머 제어 함수
    toggleTimer: timer.toggleTimer,
    resetTimer: timer.resetTimer,
    formatTime: timer.formatTime,
    calculateProgress: timer.calculateProgress,
    fastForwardTimer: timer.fastForwardTimer,

    // 설정 변경 함수
    setMode: timer.setMode,
    setTimeLeft: timer.setTimeLeft,
    setWorkDuration: settings.setWorkDuration,
    setBreakDuration: settings.setBreakDuration,
    setLongBreakDuration: settings.setLongBreakDuration,
    setWorkSessionsBeforeLongBreak: settings.setWorkSessionsBeforeLongBreak,
    setDailyGoal: stats.setDailyGoal,
    setSoundEnabled: notifications.setSoundEnabled,
    setVolume: notifications.setVolume,
    setAutoStartNextSession: timer.setAutoStartNextSession,
    setShowNotification: notifications.setShowNotification,

    // 테스트 모드 함수
    toggleTestMode: timer.toggleTestMode,
    setShowTestControls: settings.setShowTestControls,
    setTestDuration: timer.setTestDuration,

    // 알림 관련 함수
    requestNotificationPermission: notifications.requestNotificationPermission,
    openBrowserSettings: notifications.openBrowserSettings,

    // 이벤트 핸들러
    handleWorkDurationChange: timer.handleWorkDurationChange,
    handleBreakDurationChange: timer.handleBreakDurationChange,
    handleLongBreakDurationChange: timer.handleLongBreakDurationChange,
    handleTestDurationChange: timer.handleTestDurationChange,
    handleWorkSessionsBeforeLongBreakChange:
      timer.handleWorkSessionsBeforeLongBreakChange,
    handleDailyGoalChange,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};
