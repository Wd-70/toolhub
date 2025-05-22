"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TimerMode } from "../types";
import { usePageVisibility } from "./usePageVisibility";

/**
 * 기본 타이머 훅 - 순수하게 타이머 기능에만 집중
 */
interface UseTimerProps {
  // 타이머 초기 설정
  initialDuration: number;
  globalModeEnabled?: boolean;
  isTestMode?: boolean;
  onTimerComplete?: () => void;
}

export function useTimer({
  initialDuration,
  globalModeEnabled = true,
  isTestMode = false,
  onTimerComplete,
}: UseTimerProps) {
  // 타이머 상태
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [isActive, setIsActive] = useState<boolean>(false);

  // 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 시간 저장 참조 (일시정지 시 사용)
  const savedTimeRef = useRef<number | null>(null);

  // 페이지 가시성 감지
  const { isPomodoro } = usePageVisibility();
  const isPomodoroRef = useRef(isPomodoro);

  // 외부 duration이 변경되면 타이머 시간 업데이트 (타이머가 실행 중이 아닐 때만)
  useEffect(() => {
    if (!isActive && savedTimeRef.current === null) {
      setTimeLeft(initialDuration);
    }
  }, [initialDuration, isActive]);

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

    // 시간 설정
    setTimeLeft(initialDuration);
  }, [initialDuration, stopTimer]);

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

      timerRef.current = setInterval(
        () => {
          setTimeLeft((prev) => {
            // 타이머 종료
            if (prev <= 1) {
              console.log("타이머 종료");
              stopTimer();

              // 타이머 완료 콜백 호출
              if (onTimerComplete) {
                onTimerComplete();
              }

              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        },
        isTestMode ? 100 : 1000
      ); // 테스트 모드에서는 더 빠르게 타이머 진행

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isActive, globalModeEnabled, stopTimer, onTimerComplete, isTestMode]);

  // 기타 유틸리티 함수
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const calculateProgress = useCallback((): number => {
    return ((initialDuration - timeLeft) / initialDuration) * 100;
  }, [initialDuration, timeLeft]);

  // 타이머 빨리 감기 (테스트용)
  const fastForwardTimer = useCallback(() => {
    if (isActive) {
      // 타이머를 5초 남기고 빨리감기
      setTimeLeft(5);
    }
  }, [isActive]);

  return {
    // 상태
    timeLeft,
    isActive,

    // 타이머 액션
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    toggleTimer,
    setTimeLeft,

    // 유틸리티
    formatTime,
    calculateProgress,
    fastForwardTimer,
  };
}
