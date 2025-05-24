"use client";

export type TimerMode = "work" | "break" | "longBreak";

export type SessionData = {
  type: TimerMode;
  duration: number;
  timestamp: Date;
};

export type NotificationPermissionType = "default" | "denied" | "granted";

export interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  workSessionsBeforeLongBreak: number;
  completedWorkSessions: number;
  currentSessionNumber: number;
  todayCompletedSessions: number;
  sessions: SessionData[];
  dailyGoal: number;
}

export interface TimerSettings {
  soundEnabled: boolean;
  volume: number;
  autoStartNextSession: boolean;
  showNotification: boolean;
  notificationPermission: NotificationPermissionType;
  testMode: boolean;
  testDuration: number;
  showTestControls: boolean;
  globalModeEnabled: boolean;
}

export interface TimerActions {
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
  calculateProgress: () => number;
  fastForwardTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (timeLeft: number) => void;
  setWorkDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setWorkSessionsBeforeLongBreak: (count: number) => void;
  setDailyGoal: (goal: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setAutoStartNextSession: (auto: boolean) => void;
  setShowNotification: (show: boolean) => void;
  toggleTestMode: () => void;
  setShowTestControls: (show: boolean) => void;
  setTestDuration: (duration: number) => void;
  setGlobalModeEnabled: (enabled: boolean) => void;
  requestNotificationPermission: () => void;
  openBrowserSettings: () => void;
  playSound: () => void;
}

export interface TimerHandlers {
  handleWorkDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBreakDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLongBreakDurationChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleTestDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWorkSessionsBeforeLongBreakChange: (value: string) => void;
  handleDailyGoalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export type PomodoroContextType = TimerState &
  TimerSettings &
  TimerActions &
  TimerHandlers;
