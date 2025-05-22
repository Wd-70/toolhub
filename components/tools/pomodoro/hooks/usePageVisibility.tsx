"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 페이지 가시성을 감지하는 훅
 *
 * @returns {{ isVisible: boolean, isPomodoro: boolean }} 포모도로 페이지 표시 여부와 현재 페이지가 포모도로 페이지인지 여부
 */
export function usePageVisibility() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  // 현재 페이지가 포모도로 페이지인지 확인
  const isPomodoro = pathname?.includes("/tools/pomodoro") || false;

  useEffect(() => {
    // 페이지 전환 감지
    setIsVisible(isPomodoro);
  }, [pathname, isPomodoro]);

  return { isVisible, isPomodoro };
}
