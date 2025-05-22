"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 페이지 가시성을 감지하는 훅
 *
 * @returns {{ isVisible: boolean, isPomodoro: boolean, wasHidden: boolean }} 포모도로 페이지 표시 여부, 현재 페이지가 포모도로 페이지인지 여부, 이전에 숨겨져 있었는지 여부
 */
export function usePageVisibility() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [wasHidden, setWasHidden] = useState(false);
  const prevVisibleRef = useRef(true);
  const prevPathRef = useRef(pathname);

  // 현재 페이지가 포모도로 페이지인지 확인
  const isPomodoro = pathname?.includes("/tools/pomodoro") || false;

  // 다른 툴을 선택했는지 확인 (포모도로에서 다른 툴로 이동)
  const isDifferentTool =
    prevPathRef.current?.includes("/tools/pomodoro") &&
    pathname?.includes("/tools") &&
    !pathname?.includes("/tools/pomodoro");

  useEffect(() => {
    // 페이지 전환 감지
    if ((prevVisibleRef.current && !isPomodoro) || isDifferentTool) {
      // 페이지를 벗어날 때 또는 다른 툴로 이동할 때
      setWasHidden(true);
    } else if (!prevVisibleRef.current && isPomodoro) {
      // 페이지로 돌아올 때 (wasHidden 상태는 유지)
    }

    // 현재 가시성 상태 업데이트
    setIsVisible(isPomodoro);
    prevVisibleRef.current = isPomodoro;
    prevPathRef.current = pathname;
  }, [pathname, isPomodoro, isDifferentTool]);

  return {
    isVisible,
    isPomodoro,
    wasHidden,
    resetWasHidden: () => setWasHidden(false),
  };
}
