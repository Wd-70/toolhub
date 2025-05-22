"use client";

import { useState, useCallback, useEffect } from "react";
import { TimerMode, SessionData } from "../types";
import { useTimer } from "./useTimer";

interface UseSessionProps {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  workSessionsBeforeLongBreak: number;
  autoStartNextSession?: boolean;
  globalModeEnabled?: boolean;
  isTestMode?: boolean;
  onSessionComplete?: (mode: TimerMode, duration: number) => void;
}

export function useSession({
  workDuration,
  breakDuration,
  longBreakDuration,
  workSessionsBeforeLongBreak,
  autoStartNextSession = true,
  globalModeEnabled = true,
  isTestMode = false,
  onSessionComplete,
}: UseSessionProps) {
  // 세션 상태
  const [mode, setMode] = useState<TimerMode>("work");
  const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(0);
  const [currentSessionNumber, setCurrentSessionNumber] = useState<number>(1);
  const [sessions, setSessions] = useState<SessionData[]>([]);

  // 현재 모드에 따른 타이머 시간 계산
  const getCurrentDuration = useCallback(() => {
    return mode === "work"
      ? workDuration * 60
      : mode === "break"
      ? breakDuration * 60
      : longBreakDuration * 60;
  }, [mode, workDuration, breakDuration, longBreakDuration]);

  // 타이머 완료 핸들러
  const handleTimerComplete = useCallback(() => {
    // 세션 기록
    const sessionDuration =
      mode === "work"
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
    if (onSessionComplete) {
      onSessionComplete(mode, sessionDuration);
    }

    // 다음 모드와 시간 계산
    let nextMode: TimerMode;
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
      } else {
        nextMode = "break";
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
    }

    // 모드 변경
    setMode(nextMode);
  }, [
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    completedWorkSessions,
    currentSessionNumber,
    workSessionsBeforeLongBreak,
    onSessionComplete,
  ]);

  // useTimer 훅 사용
  const timer = useTimer({
    initialDuration: getCurrentDuration(),
    globalModeEnabled,
    isTestMode,
    onTimerComplete: handleTimerComplete,
  });

  // 모드나 시간 설정이 변경되면 타이머 초기화 (타이머가 실행 중이 아닐 때만)
  useEffect(() => {
    if (!timer.isActive) {
      timer.setTimeLeft(getCurrentDuration());
    }
  }, [getCurrentDuration, mode, timer]);

  // 세션 리셋 함수
  const resetSession = useCallback(() => {
    // 작업 세션 카운트 초기화
    setCompletedWorkSessions(0);

    // 현재 세션 번호 초기화
    setCurrentSessionNumber(1);

    // 모드 변경
    setMode("work");

    // 타이머 리셋
    timer.resetTimer();
  }, [timer]);

  // 빠른 테스트를 위한 함수
  const skipToNextSession = useCallback(() => {
    // 현재 타이머가 동작 중이면 중지
    if (timer.isActive) {
      timer.stopTimer();
    }

    // 다음 세션으로 전환
    handleTimerComplete();

    // 자동 시작 설정이 켜져 있으면 다음 세션 자동 시작
    if (autoStartNextSession) {
      timer.startTimer();
    }
  }, [timer, handleTimerComplete, autoStartNextSession]);

  return {
    // 세션 상태
    mode,
    completedWorkSessions,
    currentSessionNumber,
    sessions,

    // 타이머 상태 및 기능
    ...timer,

    // 세션 액션
    resetSession,
    skipToNextSession,
    setMode,
  };
}
