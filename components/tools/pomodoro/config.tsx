/**
 * 포모도로 타이머 설정 파일
 */

// 개발 모드 여부 - 개발 중에만 true로 설정하고 배포 시 false로 변경
export const ENABLE_TEST_MODE_UI = false;

// 타이머 기본 설정
export const DEFAULT_SETTINGS = {
  workDuration: 25, // 작업 시간(분)
  breakDuration: 5, // 휴식 시간(분)
  longBreakDuration: 15, // 긴 휴식 시간(분)
  workSessionsBeforeLongBreak: 4, // 긴 휴식 전 작업 세션 수
};

// 테스트 모드 설정
export const TEST_MODE_SETTINGS = {
  defaultTestDuration: 10, // 테스트 모드에서의 기본 시간(초)
};
