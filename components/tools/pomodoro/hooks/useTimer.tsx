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
  isTestMode?: boolean;
  onTimerComplete?: () => void;
}

export function useTimer({
  initialDuration,
  isTestMode = false,
  onTimerComplete,
}: UseTimerProps) {
  // 타이머 상태
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [isActive, setIsActive] = useState<boolean>(false);

  // 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 외부 duration이 변경되면 타이머 시간 업데이트 (타이머가 실행 중이 아닐 때만)
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(initialDuration);
    }
  }, [initialDuration]);

  // 타이머 중지 함수
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 타이머 일시정지 함수 - 현재 timeLeft 값을 그대로 유지
  const pauseTimer = useCallback(() => {
    if (isActive) {
      console.log("타이머 일시정지 - 현재 시간:", timeLeft);

      // 타이머 중지
      stopTimer();
      setIsActive(false);

      // timeLeft 값은 변경하지 않음 - 현재 상태 그대로 유지
    }
  }, [isActive, timeLeft, stopTimer]);

  // 타이머 시작 함수
  const startTimer = useCallback(() => {
    // 이미 타이머가 활성화되었으면 아무것도 하지 않음
    if (isActive) return;

    console.log("타이머 시작 - 현재 시간:", timeLeft);

    // 현재 timeLeft 값을 그대로 사용 - 일시정지 상태에서 재개할 때 유용
    setIsActive(true);
  }, [isActive, timeLeft]);

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

    // 시간 설정
    setTimeLeft(initialDuration);
  }, [initialDuration, stopTimer]);

  // 타이머 실행 효과
  useEffect(() => {
    if (isActive) {
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
  }, [isActive, isTestMode, stopTimer, onTimerComplete]);

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
