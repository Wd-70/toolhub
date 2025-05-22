"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TimerMode, SessionData } from "../types";
import { usePageVisibility } from "./usePageVisibility";

interface UseTimerOptions {
  onSessionComplete?: (mode: TimerMode, duration: number) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  // 타이머 상태
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [workDuration, setWorkDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);
  const [workSessionsBeforeLongBreak, setWorkSessionsBeforeLongBreak] =
    useState<number>(4);
  const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(0);
  const [currentSessionNumber, setCurrentSessionNumber] = useState<number>(1);
  const [sessions, setSessions] = useState<SessionData[]>([]);

  // 테스트 모드 관련 상태
  const [testMode, setTestMode] = useState<boolean>(false);
  const [testDuration, setTestDuration] = useState<number>(10); // 테스트 모드에서의 기본 시간(초)

  // 전역 모드 설정
  const [globalModeEnabled, setGlobalModeEnabled] = useState<boolean>(true); // 기본적으로 전역 모드 활성화

  // 세션 자동 시작 설정
  const [autoStartNextSession, setAutoStartNextSession] =
    useState<boolean>(true);

  // 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 시간 저장 참조 (일시정지 시 사용)
  const savedTimeRef = useRef<number | null>(null);

  // 페이지 가시성 감지 - 단순화된 버전
  const { isPomodoro } = usePageVisibility();
  const isPomodoroRef = useRef(isPomodoro);

  // 현재 페이지가 포모도로 페이지인지 업데이트
  useEffect(() => {
    // 이전 상태 업데이트
    const previousIsPomodoro = isPomodoroRef.current;
    isPomodoroRef.current = isPomodoro;

    // 전역 모드가 아니고, 포모도로 페이지에서 벗어났고, 타이머가 활성화된 경우 -> 타이머 멈춤
    if (!globalModeEnabled && previousIsPomodoro && !isPomodoro && isActive) {
      console.log("페이지 전환으로 타이머 정지");
      pauseTimer();
    }
  }, [isPomodoro, globalModeEnabled, isActive]);

  // 테스트 모드 또는 모드가 변경될 때 타이머 시간 업데이트
  useEffect(() => {
    // 타이머가 실행 중이 아니고 저장된 시간이 없을 때만 초기화
    if (!isActive && savedTimeRef.current === null) {
      const newTime = testMode
        ? testDuration
        : mode === "work"
        ? workDuration * 60
        : mode === "break"
        ? breakDuration * 60
        : longBreakDuration * 60;

      setTimeLeft(newTime);
    }
  }, [
    testMode,
    testDuration,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    isActive,
  ]);

  // 타이머 중지 함수
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 타이머 일시정지 함수
  const pauseTimer = useCallback(() => {
    if (isActive) {
      console.log("타이머 일시정지 - 현재 시간 저장:", timeLeft);
      // 현재 시간 저장
      savedTimeRef.current = timeLeft;

      // 타이머 중지
      stopTimer();
      setIsActive(false);
    }
  }, [isActive, timeLeft, stopTimer]);

  // 타이머 시작 함수
  const startTimer = useCallback(() => {
    // 이미 타이머가 활성화되었으면 아무것도 하지 않음
    if (isActive) return;

    // 전역 모드가 아니고 포모도로 페이지가 아니면 타이머 시작하지 않음
    if (!globalModeEnabled && !isPomodoroRef.current) {
      console.log(
        "전역 모드가 아니고 포모도로 페이지가 아니어서 타이머 시작하지 않음"
      );
      return;
    }

    console.log("타이머 시작");

    // 일시정지된 시간이 있으면 그 시간부터 시작
    if (savedTimeRef.current !== null) {
      console.log("저장된 시간부터 시작:", savedTimeRef.current);
      setTimeLeft(savedTimeRef.current);
      savedTimeRef.current = null;
    }

    setIsActive(true);
  }, [isActive, globalModeEnabled]);

  // 타이머 토글 함수
  const toggleTimer = useCallback(() => {
    if (isActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isActive, pauseTimer, startTimer]);

  // 타이머 리셋 함수
  const resetTimer = useCallback(() => {
    console.log("타이머 리셋");
    stopTimer();
    setIsActive(false);
    savedTimeRef.current = null;

    // 작업 세션 카운트 초기화
    setCompletedWorkSessions(0);

    // 현재 세션 번호 초기화
    setCurrentSessionNumber(1);

    // 모드 변경
    setMode("work");

    // 시간 설정
    const time = testMode ? testDuration : workDuration * 60;
    setTimeLeft(time);
  }, [testMode, testDuration, workDuration, stopTimer]);

  // 다음 세션으로 전환하는 함수
  const moveToNextSession = useCallback(() => {
    // 세션 기록
    const sessionDuration = testMode
      ? testDuration
      : mode === "work"
      ? workDuration * 60
      : mode === "break"
      ? breakDuration * 60
      : longBreakDuration * 60;

    // 새 세션 추가
    const newSession = {
      type: mode,
      duration: sessionDuration,
      timestamp: new Date(),
    };

    setSessions((prev) => [...prev, newSession]);

    // 콜백 호출
    if (options.onSessionComplete) {
      options.onSessionComplete(mode, sessionDuration);
    }

    // 다음 모드와 시간 계산
    let nextMode: TimerMode;
    let nextTime: number;
    let newCompletedSessions = completedWorkSessions;
    let newSessionNumber = currentSessionNumber;

    // 작업 세션 완료시
    if (mode === "work") {
      // 완료된 세션 수 증가
      newCompletedSessions = completedWorkSessions + 1;

      // 다음 모드 결정
      if (
        newCompletedSessions > 0 &&
        newCompletedSessions % workSessionsBeforeLongBreak === 0
      ) {
        nextMode = "longBreak";
        nextTime = testMode ? testDuration : longBreakDuration * 60;
      } else {
        nextMode = "break";
        nextTime = testMode ? testDuration : breakDuration * 60;
      }

      // 완료된 세션 수 업데이트
      setCompletedWorkSessions(newCompletedSessions);
    }
    // 휴식 세션 완료시
    else {
      // 다음 세션 번호 증가
      newSessionNumber = currentSessionNumber + 1;
      setCurrentSessionNumber(newSessionNumber);

      // 작업 모드로 전환
      nextMode = "work";
      nextTime = testMode ? testDuration : workDuration * 60;
    }

    // 모드 변경
    setMode(nextMode);

    // 타이머 시간 설정
    setTimeLeft(nextTime);

    // 자동 시작 설정이 켜져 있으면 다음 세션 자동 시작
    if (autoStartNextSession) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [
    mode,
    testMode,
    testDuration,
    workDuration,
    breakDuration,
    longBreakDuration,
    completedWorkSessions,
    currentSessionNumber,
    workSessionsBeforeLongBreak,
    autoStartNextSession,
    options.onSessionComplete,
  ]);

  // 타이머 실행 효과
  useEffect(() => {
    if (isActive) {
      // 전역 모드가 아니고 포모도로 페이지가 아니면 타이머 시작하지 않음
      if (!globalModeEnabled && !isPomodoroRef.current) {
        console.log(
          "전역 모드가 아니고 포모도로 페이지가 아니어서 타이머 활성화 취소"
        );
        setIsActive(false);
        return;
      }

      console.log("타이머 인터벌 시작");

      // 이전 타이머 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // 타이머 종료
          if (prev <= 1) {
            console.log("타이머 종료");
            stopTimer();

            // 다음 세션으로 전환
            moveToNextSession();

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isActive, globalModeEnabled, stopTimer, moveToNextSession]);

  // 기타 유틸리티 함수
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const calculateProgress = useCallback((): number => {
    const totalSeconds = testMode
      ? testDuration
      : mode === "work"
      ? workDuration * 60
      : mode === "break"
      ? breakDuration * 60
      : longBreakDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  }, [
    testMode,
    testDuration,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    timeLeft,
  ]);

  // 타이머 빨리 감기 (테스트용)
  const fastForwardTimer = useCallback(() => {
    if (isActive) {
      // 타이머를 5초 남기고 빨리감기
      setTimeLeft(5);
    }
  }, [isActive]);

  // 테스트 모드 함수
  const toggleTestMode = useCallback(() => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);

    // 타이머가 실행 중이면 먼저 중지
    if (isActive) {
      stopTimer();
      setIsActive(false);
    }

    // 저장된 시간 초기화
    savedTimeRef.current = null;

    // 테스트 모드에 맞는 시간 설정
    setTimeLeft(
      newTestMode
        ? testDuration
        : mode === "work"
        ? workDuration * 60
        : mode === "break"
        ? breakDuration * 60
        : longBreakDuration * 60
    );
  }, [
    testMode,
    testDuration,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    isActive,
    stopTimer,
  ]);

  // 이벤트 핸들러
  const handleWorkDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setWorkDuration(value);
        if (mode === "work" && !isActive && !testMode) {
          setTimeLeft(value * 60);
        }
      }
    },
    [mode, isActive, testMode]
  );

  const handleBreakDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setBreakDuration(value);
        if (mode === "break" && !isActive && !testMode) {
          setTimeLeft(value * 60);
        }
      }
    },
    [mode, isActive, testMode]
  );

  const handleLongBreakDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setLongBreakDuration(value);
        if (mode === "longBreak" && !isActive && !testMode) {
          setTimeLeft(value * 60);
        }
      }
    },
    [mode, isActive, testMode]
  );

  const handleTestDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setTestDuration(value);
        if (!isActive && testMode) {
          setTimeLeft(value);
        }
      }
    },
    [isActive, testMode]
  );

  const handleWorkSessionsBeforeLongBreakChange = useCallback(
    (value: string) => {
      const numValue = Number.parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        setWorkSessionsBeforeLongBreak(numValue);
      }
    },
    []
  );

  return {
    // 상태
    mode,
    timeLeft,
    isActive,
    workDuration,
    breakDuration,
    longBreakDuration,
    workSessionsBeforeLongBreak,
    completedWorkSessions,
    currentSessionNumber,
    sessions,
    testMode,
    testDuration,
    globalModeEnabled,
    autoStartNextSession,

    // 액션
    setMode,
    setTimeLeft,
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setWorkSessionsBeforeLongBreak,
    setCompletedWorkSessions,
    setCurrentSessionNumber,
    setSessions,
    setTestMode,
    setTestDuration,
    setGlobalModeEnabled,
    setAutoStartNextSession,
    toggleTimer,
    resetTimer,
    formatTime,
    calculateProgress,
    fastForwardTimer,
    toggleTestMode,

    // 이벤트 핸들러
    handleWorkDurationChange,
    handleBreakDurationChange,
    handleLongBreakDurationChange,
    handleTestDurationChange,
    handleWorkSessionsBeforeLongBreakChange,
  };
}
