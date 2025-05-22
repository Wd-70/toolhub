"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "./hooks/useSession";
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

  // 테스트 모드 상태
  const [testMode, setTestMode] = React.useState(false);
  const [testDuration, setTestDuration] = React.useState(10); // 테스트 모드에서의 기본 시간(초)

  // 세션 및 타이머 관련 훅
  const session = useSession({
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
    workSessionsBeforeLongBreak: settings.workSessionsBeforeLongBreak,
    autoStartNextSession: settings.autoStartNextSession,
    globalModeEnabled: settings.globalModeEnabled,
    isTestMode: testMode,
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

  // 테스트 모드 토글 함수
  const toggleTestMode = React.useCallback(() => {
    setTestMode((prev) => !prev);
  }, []);

  // 이벤트 핸들러
  const handleDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      stats.setDailyGoal(value);
    }
  };

  // 테스트 시간 변경 핸들러
  const handleTestDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTestDuration(value);
    }
  };

  const contextValue: PomodoroContextType = {
    // 타이머 및 세션 상태
    mode: session.mode,
    timeLeft: session.timeLeft,
    isActive: session.isActive,
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
    workSessionsBeforeLongBreak: settings.workSessionsBeforeLongBreak,
    completedWorkSessions: session.completedWorkSessions,
    currentSessionNumber: session.currentSessionNumber,
    todayCompletedSessions: stats.todayCompletedSessions,
    sessions: session.sessions,
    dailyGoal: stats.dailyGoal,

    // 설정
    soundEnabled: notifications.soundEnabled,
    volume: notifications.volume,
    autoStartNextSession: settings.autoStartNextSession,
    showNotification: notifications.showNotification,
    notificationPermission: notifications.notificationPermission,

    // 테스트 모드
    testMode,
    testDuration,
    showTestControls: settings.showTestControls,

    // 전역 모드 설정
    globalModeEnabled: settings.globalModeEnabled,
    setGlobalModeEnabled: settings.setGlobalModeEnabled,

    // 타이머 제어 함수
    toggleTimer: session.toggleTimer,
    resetTimer: session.resetSession, // 세션까지 모두 리셋
    formatTime: session.formatTime,
    calculateProgress: session.calculateProgress,
    fastForwardTimer: session.fastForwardTimer,

    // 설정 변경 함수
    setMode: session.setMode,
    setTimeLeft: session.setTimeLeft,
    setWorkDuration: settings.setWorkDuration,
    setBreakDuration: settings.setBreakDuration,
    setLongBreakDuration: settings.setLongBreakDuration,
    setWorkSessionsBeforeLongBreak: settings.setWorkSessionsBeforeLongBreak,
    setDailyGoal: stats.setDailyGoal,
    setSoundEnabled: notifications.setSoundEnabled,
    setVolume: notifications.setVolume,
    setAutoStartNextSession: settings.setAutoStartNextSession,
    setShowNotification: notifications.setShowNotification,

    // 테스트 모드 함수
    toggleTestMode,
    setShowTestControls: settings.setShowTestControls,
    setTestDuration,

    // 알림 관련 함수
    requestNotificationPermission: notifications.requestNotificationPermission,
    openBrowserSettings: notifications.openBrowserSettings,

    // 이벤트 핸들러
    handleWorkDurationChange: (e) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        settings.setWorkDuration(value);
      }
    },
    handleBreakDurationChange: (e) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        settings.setBreakDuration(value);
      }
    },
    handleLongBreakDurationChange: (e) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        settings.setLongBreakDuration(value);
      }
    },
    handleTestDurationChange,
    handleWorkSessionsBeforeLongBreakChange: (value) => {
      const numValue = Number.parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        settings.setWorkSessionsBeforeLongBreak(numValue);
      }
    },
    handleDailyGoalChange,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};
