"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "./hooks/useSession";
import { useNotification } from "./hooks/useNotification";
import { useSettings } from "./hooks/useSettings";
import { useStats } from "./hooks/useStats";
import { PomodoroContextType } from "./types";
import { ENABLE_TEST_MODE_UI, TEST_MODE_SETTINGS } from "./config";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

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

// 쿠키 관련 상수
const COOKIE_OPTIONS = {
  domain: ".toolhub.services", // 모든 서브도메인에서 접근 가능하도록 설정
  path: "/", // 모든 경로에서 접근 가능하도록 설정
  maxAge: 60 * 60 * 24, // 24시간 유효
  sameSite: "lax" as const, // CSRF 방지를 위한 SameSite 설정
};

// 로컬 개발 환경에서는 도메인 설정 변경
const getOptions = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return { ...COOKIE_OPTIONS, domain: "localhost" };
  }
  return COOKIE_OPTIONS;
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

  // 테스트 모드 상태 - 개발 모드에서만 초기화
  const [testMode, setTestMode] = React.useState(false);
  const [testDuration, setTestDuration] = React.useState(
    TEST_MODE_SETTINGS.defaultTestDuration
  );

  // 세션 및 타이머 관련 훅
  const session = useSession({
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
    workSessionsBeforeLongBreak: settings.workSessionsBeforeLongBreak,
    autoStartNextSession: settings.autoStartNextSession,
    globalModeEnabled: settings.globalModeEnabled,
    isTestMode: testMode && ENABLE_TEST_MODE_UI, // 개발 모드가 아니면 테스트 모드도 비활성화
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

      // 세션 완료 시 쿠키도 업데이트
      updateCookieState({
        isRunning: false,
        mode,
        timeLeft: 0,
      });
    },
  });

  // 테스트 모드 토글 함수
  const toggleTestMode = React.useCallback(() => {
    // 개발 모드에서만 토글 가능
    if (ENABLE_TEST_MODE_UI) {
      setTestMode((prev) => !prev);
    }
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

  // 쿠키 상태 업데이트 함수
  const updateCookieState = React.useCallback(
    ({
      isRunning,
      mode,
      timeLeft,
    }: {
      isRunning?: boolean;
      mode?: "work" | "break" | "longBreak";
      timeLeft?: number;
    }) => {
      // 현재 시간을 타임스탬프로 저장
      const now = Date.now();

      // 기존 상태를 먼저 읽어서 변경된 것만 업데이트
      const currentIsRunning = getCookie("pomodoro-is-running") === "true";
      const currentMode = getCookie("pomodoro-mode") || mode || "work";
      const currentTimeLeft = Number(
        getCookie("pomodoro-time-left") || timeLeft || 0
      );

      // 쿠키에 상태 저장
      if (isRunning !== undefined) {
        setCookie("pomodoro-is-running", isRunning.toString(), getOptions());

        // 타이머가 시작될 때만 시작 시간 업데이트
        if (isRunning) {
          setCookie("pomodoro-start-time", now.toString(), getOptions());
        } else {
          setCookie("pomodoro-start-time", "0", getOptions());
        }
      }

      if (mode !== undefined) {
        setCookie("pomodoro-mode", mode, getOptions());
      }

      if (timeLeft !== undefined) {
        setCookie("pomodoro-time-left", timeLeft.toString(), getOptions());
      }

      // 글로벌 모드 상태도 저장
      setCookie(
        "pomodoro-global-mode",
        settings.globalModeEnabled.toString(),
        getOptions()
      );

      // 지속 시간 설정도 저장
      setCookie(
        "pomodoro-work-duration",
        settings.workDuration.toString(),
        getOptions()
      );
      setCookie(
        "pomodoro-break-duration",
        settings.breakDuration.toString(),
        getOptions()
      );
      setCookie(
        "pomodoro-long-break",
        settings.longBreakDuration.toString(),
        getOptions()
      );
    },
    [
      settings.globalModeEnabled,
      settings.workDuration,
      settings.breakDuration,
      settings.longBreakDuration,
    ]
  );

  // 타이머 상태가 변경될 때마다 쿠키에 저장
  React.useEffect(() => {
    updateCookieState({
      isRunning: session.isActive,
      mode: session.mode,
      timeLeft: session.timeLeft,
    });
  }, [session.isActive, session.mode, session.timeLeft, updateCookieState]);

  // 페이지 로드 시 쿠키에서 타이머 상태 복원
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // 쿠키에서 상태 정보 읽기
    const storedIsRunning = getCookie("pomodoro-is-running") === "true";
    const storedTimeLeft = Number(getCookie("pomodoro-time-left") || 0);
    const storedMode =
      (getCookie("pomodoro-mode") as "work" | "break" | "longBreak") || "work";
    const storedGlobalMode = getCookie("pomodoro-global-mode") === "true";
    const storedStartTime = Number(getCookie("pomodoro-start-time") || 0);

    // 글로벌 모드 설정
    if (storedGlobalMode !== settings.globalModeEnabled) {
      settings.setGlobalModeEnabled(storedGlobalMode);
    }

    // 타이머가 실행 중이고 시작 시간이 있으면 경과 시간 계산
    if (storedIsRunning && storedStartTime > 0) {
      const elapsedSeconds = Math.floor((Date.now() - storedStartTime) / 1000);
      const recalculatedTimeLeft = Math.max(0, storedTimeLeft - elapsedSeconds);

      // 타이머가 종료된 경우
      if (recalculatedTimeLeft <= 0) {
        session.setTimeLeft(0);
        session.toggleTimer(); // 중지 상태로 변경
      } else {
        // 타이머 상태 복원
        session.setMode(storedMode);
        session.setTimeLeft(recalculatedTimeLeft);

        // 이미 중지 상태인데 실행 중으로 복원해야 하는 경우
        if (!session.isActive && storedIsRunning) {
          session.toggleTimer();
        }
      }
    } else if (storedTimeLeft > 0 && !session.isActive) {
      // 실행 중이지 않지만 남은 시간이 있는 경우
      session.setMode(storedMode);
      session.setTimeLeft(storedTimeLeft);
    }
  }, [session, settings]);

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
    showTestControls: settings.showTestControls && ENABLE_TEST_MODE_UI,

    // 전역 모드 설정
    globalModeEnabled: settings.globalModeEnabled,
    setGlobalModeEnabled: (enabled: boolean) => {
      settings.setGlobalModeEnabled(enabled);
      setCookie("pomodoro-global-mode", enabled.toString(), getOptions());
    },

    // 타이머 제어 함수
    toggleTimer: () => {
      session.toggleTimer();
      updateCookieState({
        isRunning: !session.isActive, // toggleTimer 이후 상태는 반대가 됨
        timeLeft: session.timeLeft,
      });
    },
    resetTimer: () => {
      session.resetSession();
      updateCookieState({
        isRunning: false,
        mode: session.mode,
        timeLeft:
          session.mode === "work"
            ? settings.workDuration * 60
            : session.mode === "break"
            ? settings.breakDuration * 60
            : settings.longBreakDuration * 60,
      });
    },
    formatTime: session.formatTime,
    calculateProgress: session.calculateProgress,
    fastForwardTimer: session.fastForwardTimer,

    // 설정 변경 함수
    setMode: (mode) => {
      session.setMode(mode);
      updateCookieState({ mode });
    },
    setTimeLeft: (time) => {
      session.setTimeLeft(time);
      updateCookieState({ timeLeft: time });
    },
    setWorkDuration: (duration) => {
      settings.setWorkDuration(duration);
      setCookie("pomodoro-work-duration", duration.toString(), getOptions());
    },
    setBreakDuration: (duration) => {
      settings.setBreakDuration(duration);
      setCookie("pomodoro-break-duration", duration.toString(), getOptions());
    },
    setLongBreakDuration: (duration) => {
      settings.setLongBreakDuration(duration);
      setCookie("pomodoro-long-break", duration.toString(), getOptions());
    },
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
        setCookie("pomodoro-work-duration", value.toString(), getOptions());
      }
    },
    handleBreakDurationChange: (e) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        settings.setBreakDuration(value);
        setCookie("pomodoro-break-duration", value.toString(), getOptions());
      }
    },
    handleLongBreakDurationChange: (e) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        settings.setLongBreakDuration(value);
        setCookie("pomodoro-long-break", value.toString(), getOptions());
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
