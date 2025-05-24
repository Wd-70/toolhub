"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TimerMode, SessionData } from "../types";
import { useTimer } from "./useTimer";

interface UseSessionProps {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  workSessionsBeforeLongBreak: number;
  autoStartNextSession?: boolean;
  isTestMode?: boolean;
  onSessionComplete?: (mode: TimerMode, duration: number) => void;
}

export function useSession({
  workDuration,
  breakDuration,
  longBreakDuration,
  workSessionsBeforeLongBreak,
  autoStartNextSession = true,
  isTestMode = false,
  onSessionComplete,
}: UseSessionProps) {
  // 세션 상태
  const [mode, setMode] = useState<TimerMode>("work");
  const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(0);
  const [currentSessionNumber, setCurrentSessionNumber] = useState<number>(1);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [shouldStartNextSession, setShouldStartNextSession] =
    useState<boolean>(false);
  const isSessionTransitioning = useRef<boolean>(false);

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

    // 세션 전환 중임을 표시
    isSessionTransitioning.current = true;

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

    // 자동 시작 플래그 설정
    if (autoStartNextSession) {
      setShouldStartNextSession(true);
    }
  }, [
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    completedWorkSessions,
    currentSessionNumber,
    workSessionsBeforeLongBreak,
    onSessionComplete,
    autoStartNextSession,
  ]);

  // useTimer 훅 사용
  const timer = useTimer({
    initialDuration: getCurrentDuration(),
    isTestMode,
    onTimerComplete: handleTimerComplete,
  });

  // 모드나 시간 설정이 변경되면 타이머 초기화 (타이머가 실행 중이 아닐 때만)
  useEffect(() => {
    if (!timer.isActive) {
      // 일시정지 상태가 아닐 때만 타이머 시간을 새로 설정
      // 이렇게 하면 모드 변경 시에도 일시정지된 시간이 유지됨
      const currentTime = timer.timeLeft;
      if (currentTime === 0 || isSessionTransitioning.current) {
        // 타이머가 완료되었거나 세션 전환 중일 때 초기화
        timer.setTimeLeft(getCurrentDuration());
        isSessionTransitioning.current = false;
      }
    }
  }, [getCurrentDuration, mode, timer]);

  // 자동 시작 기능 처리를 위한 useEffect
  useEffect(() => {
    if (shouldStartNextSession && !timer.isActive) {
      // 다음 세션 자동 시작
      setTimeout(() => {
        timer.startTimer();
        setShouldStartNextSession(false);
      }, 100);
    }
  }, [shouldStartNextSession, timer]);

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

    // 자동 시작 플래그 초기화
    setShouldStartNextSession(false);
  }, [timer]);

  // 빠른 테스트를 위한 함수
  const skipToNextSession = useCallback(() => {
    // 현재 타이머가 동작 중이면 중지
    if (timer.isActive) {
      timer.stopTimer();
    }

    // 다음 세션으로 전환
    handleTimerComplete();

    // 다음 세션의 시간으로 타이머 설정 (모드가 변경된 후)
    timer.setTimeLeft(getCurrentDuration());

    // 자동 시작 설정이 켜져 있으면 다음 세션 자동 시작
    if (autoStartNextSession) {
      // 약간의 지연 후 시작 (상태 업데이트가 반영된 후)
      setTimeout(() => {
        timer.startTimer();
      }, 50);
    }
  }, [timer, handleTimerComplete, autoStartNextSession, getCurrentDuration]);

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
