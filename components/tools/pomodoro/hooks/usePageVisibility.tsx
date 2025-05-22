"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 페이지 가시성을 감지하는 훅 - 단순화된 버전
 *
 * @returns {{ isPomodoro: boolean }} 현재 페이지가 포모도로 페이지인지 여부
 */
export function usePageVisibility() {
  const pathname = usePathname();

  // 현재 페이지가 포모도로 페이지인지 확인
  const isPomodoro = pathname?.includes("/tools/pomodoro") || false;

  return {
    isPomodoro,
  };
}
