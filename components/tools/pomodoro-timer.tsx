"use client";

import type React from "react";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Info,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  Zap,
  FastForward,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useToolState } from "@/hooks/use-tool-state";

// 타입 정의
type PomodoroMode = "work" | "break" | "longBreak";
type PomodoroSession = {
  type: PomodoroMode;
  duration: number;
  timestamp: Date;
};

// 포모도로 타이머 상태 타입
interface PomodoroTimerState {
  mode: PomodoroMode;
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessions: PomodoroSession[];
  soundEnabled: boolean;
  autoStartNextSession: boolean;
  workSessionsBeforeLongBreak: number;
  completedWorkSessions: number;
  showNotification: boolean;
  dailyGoal: number;
  todayCompletedSessions: number;
  currentSessionCount: number;
  volume: number;
  testMode: boolean;
  testDuration: number;
  showTestControls: boolean;
}

// 기본 상태 값
const defaultPomodoroState: PomodoroTimerState = {
  mode: "work",
  timeLeft: 25 * 60, // 25 minutes in seconds
  isActive: false,
  isPaused: false,
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessions: [],
  soundEnabled: true,
  autoStartNextSession: true,
  workSessionsBeforeLongBreak: 4,
  completedWorkSessions: 0,
  showNotification: true,
  dailyGoal: 8,
  todayCompletedSessions: 0,
  currentSessionCount: 1,
  volume: 0.5,
  testMode: false,
  testDuration: 10,
  showTestControls: false,
};

export default function PomodoroTimer() {
  // useToolState 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();

  // 도구 상태 가져오기
  const toolState = getToolState<PomodoroTimerState>("pomodoro");

  // 첫 렌더링 여부 체크 (상태 초기화에 사용)
  const isFirstRender = useRef(true);

  // 로컬 상태 (컨텍스트로 관리하지 않는 UI 관련 상태)
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "default"
  >("default");
  const [isClient, setIsClient] = useState<boolean>(false);

  // 로컬 상태에 기본값 설정 (toolState가 없을 때 기본값 사용)
  const state = useMemo(() => {
    // 새로운 세션 여부 확인 (날짜가 바뀌었는지)
    let initialState = { ...defaultPomodoroState };

    if (toolState?.data) {
      // Context에 저장된 상태가 있으면 사용
      initialState = { ...toolState.data };

      // 날짜 체크 - 이전 날짜와 현재 날짜가 다르면 일일 통계 리셋
      const today = new Date().toDateString();
      const lastActiveDate = localStorage.getItem("pomodoro_last_active_date");

      if (lastActiveDate !== today) {
        // 새로운 날짜라면 일일 통계 초기화
        initialState.todayCompletedSessions = 0;
        localStorage.setItem("pomodoro_last_active_date", today);
      }

      // 보존된 상태가 활성 상태라면 검증 (브라우저 새로고침 등으로 타이머가 죽었을 수 있음)
      if (initialState.isActive) {
        // 타이머가 활성 상태였지만 새로 로드될 때는 일시정지 상태로 설정
        initialState.isPaused = true;
      }
    } else {
      // 최초 실행 시 오늘 날짜 저장
      localStorage.setItem(
        "pomodoro_last_active_date",
        new Date().toDateString()
      );
    }

    return initialState;
  }, [toolState?.data]);

  // 로컬 상태로 사용하던 것을 컨텍스트로 관리
  const [mode, setMode] = useState<PomodoroMode>(state.mode);
  const [timeLeft, setTimeLeft] = useState<number>(state.timeLeft);
  const [isActive, setIsActive] = useState<boolean>(state.isActive);
  const [isPaused, setIsPaused] = useState<boolean>(state.isPaused);
  const [workDuration, setWorkDuration] = useState<number>(state.workDuration);
  const [breakDuration, setBreakDuration] = useState<number>(
    state.breakDuration
  );
  const [longBreakDuration, setLongBreakDuration] = useState<number>(
    state.longBreakDuration
  );
  const [sessions, setSessions] = useState<PomodoroSession[]>(state.sessions);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(state.soundEnabled);
  const [autoStartNextSession, setAutoStartNextSession] = useState<boolean>(
    state.autoStartNextSession
  );
  const [workSessionsBeforeLongBreak, setWorkSessionsBeforeLongBreak] =
    useState<number>(state.workSessionsBeforeLongBreak);
  const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(
    state.completedWorkSessions
  );
  const [showNotification, setShowNotification] = useState<boolean>(
    state.showNotification
  );
  const [dailyGoal, setDailyGoal] = useState<number>(state.dailyGoal);
  const [todayCompletedSessions, setTodayCompletedSessions] = useState<number>(
    state.todayCompletedSessions
  );
  const [currentSessionCount, setCurrentSessionCount] = useState<number>(
    state.currentSessionCount
  );
  const [volume, setVolume] = useState<number>(state.volume);
  const [testMode, setTestMode] = useState<boolean>(state.testMode);
  const [testDuration, setTestDuration] = useState<number>(state.testDuration);
  const [showTestControls, setShowTestControls] = useState<boolean>(
    state.showTestControls
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<Notification | null>(null);

  // 상태 업데이트 함수 - 모든 상태 변경을 Context에 저장
  const updatePomodoroState = () => {
    // 현재 상태를 가져와서 Context에 저장
    updateToolState<PomodoroTimerState>("pomodoro", {
      mode,
      timeLeft,
      isActive,
      isPaused,
      workDuration,
      breakDuration,
      longBreakDuration,
      sessions,
      soundEnabled,
      autoStartNextSession,
      workSessionsBeforeLongBreak,
      completedWorkSessions,
      showNotification,
      dailyGoal,
      todayCompletedSessions,
      currentSessionCount,
      volume,
      testMode,
      testDuration,
      showTestControls,
    });
  };

  // 개별 상태 업데이트 래퍼 함수들
  const updateMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    // 변경 후 즉시 Context 업데이트
    updatePomodoroState();
  };

  const updateTimeLeft = (newTimeLeft: number) => {
    setTimeLeft(newTimeLeft);
    // 변경 후 즉시 Context 업데이트
    updatePomodoroState();
  };

  const updateIsActive = (newIsActive: boolean) => {
    setIsActive(newIsActive);
    // 변경 후 즉시 Context 업데이트
    updatePomodoroState();

    // 활성화 상태 변경 시 히스토리 기록
    if (newIsActive) {
      addHistoryEntry("pomodoro", "open");
    } else {
      addHistoryEntry("pomodoro", "close");
    }
  };

  const updateIsPaused = (newIsPaused: boolean) => {
    setIsPaused(newIsPaused);
    // 변경 후 즉시 Context 업데이트
    updatePomodoroState();
  };

  useEffect(() => {
    // 클라이언트 사이드 체크
    setIsClient(true);

    // 오디오 요소 생성
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3");
    }

    // 알림 권한 확인 및 상태 설정
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = Notification.permission;
        setNotificationPermission(permission);
        console.log("현재 알림 권한 상태:", permission);
      } catch (error) {
        console.error("알림 권한 확인 중 오류:", error);
        setNotificationPermission("default");
      }
    }

    // 컴포넌트 마운트 시 상태 초기화 (최초 1회)
    if (isFirstRender.current) {
      // 중요: 여기서는 isFirstRender를 false로 설정하지 않음
      // Context 상태 동기화 useEffect에서 처리함

      // 지속된 상태가 있고 타이머가 활성화된 상태라면,
      // 브라우저 새로고침 등으로 타이머가 중단됐을 수 있으므로 일시정지 상태로 설정
      if (state.isActive) {
        // 타이머 시간이 0이 아닌 경우 일시정지 상태로 설정
        if (state.timeLeft > 0) {
          console.log("타이머 일시정지 상태로 초기화 (기존 활성 상태)");
          setIsPaused(true);
        } else {
          // 타이머 시간이 0인 경우 타이머 비활성화
          console.log("타이머 비활성화 (기존 타이머 완료)");
          setIsActive(false);
        }

        // 상태 변경 후 Context 업데이트
        setTimeout(() => updatePomodoroState(), 0);
      }
    }

    // 타이머 초기화 및 정리
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Context 상태가 변경될 때마다 로컬 상태 동기화
  useEffect(() => {
    // 새로운 상태가 있을 때만 실행
    if (toolState?.data) {
      // 첫 렌더링에서는 이미 useMemo에서 초기화했으므로 체크 자체를 건너뜀
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      const {
        mode: contextMode,
        timeLeft: contextTimeLeft,
        isActive: contextIsActive,
        isPaused: contextIsPaused,
        workDuration: contextWorkDuration,
        breakDuration: contextBreakDuration,
        longBreakDuration: contextLongBreakDuration,
        sessions: contextSessions,
        soundEnabled: contextSoundEnabled,
        autoStartNextSession: contextAutoStartNextSession,
        workSessionsBeforeLongBreak: contextWorkSessionsBeforeLongBreak,
        completedWorkSessions: contextCompletedWorkSessions,
        showNotification: contextShowNotification,
        dailyGoal: contextDailyGoal,
        todayCompletedSessions: contextTodayCompletedSessions,
        currentSessionCount: contextCurrentSessionCount,
        volume: contextVolume,
        testMode: contextTestMode,
        testDuration: contextTestDuration,
        showTestControls: contextShowTestControls,
      } = toolState.data;

      // 값이 다를 때만 상태 업데이트
      if (mode !== contextMode) setMode(contextMode);
      if (timeLeft !== contextTimeLeft) setTimeLeft(contextTimeLeft);

      // 활성 상태와 일시정지 상태는 함께 처리
      const activeStateChanged =
        isActive !== contextIsActive || isPaused !== contextIsPaused;
      if (activeStateChanged) {
        // 타이머가 외부에서 활성화된 경우, 타이머 시작 또는 일시정지 처리
        setIsActive(contextIsActive);
        setIsPaused(contextIsPaused);

        // 타이머가 활성화되면 타이머 시작 (setInterval은 isActive useEffect에서 처리됨)
        // 활성화되지 않았으나 변경이 있는 경우 (타이머가 중지된 경우)
        if (!contextIsActive && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }

      // 나머지 상태 업데이트
      if (workDuration !== contextWorkDuration)
        setWorkDuration(contextWorkDuration);
      if (breakDuration !== contextBreakDuration)
        setBreakDuration(contextBreakDuration);
      if (longBreakDuration !== contextLongBreakDuration)
        setLongBreakDuration(contextLongBreakDuration);

      // 세션 정보는 참조만 비교하면 불충분하므로 내용을 비교
      const sessionsChanged =
        JSON.stringify(sessions) !== JSON.stringify(contextSessions);
      if (sessionsChanged) setSessions(contextSessions);

      if (soundEnabled !== contextSoundEnabled)
        setSoundEnabled(contextSoundEnabled);
      if (autoStartNextSession !== contextAutoStartNextSession)
        setAutoStartNextSession(contextAutoStartNextSession);
      if (workSessionsBeforeLongBreak !== contextWorkSessionsBeforeLongBreak)
        setWorkSessionsBeforeLongBreak(contextWorkSessionsBeforeLongBreak);
      if (completedWorkSessions !== contextCompletedWorkSessions)
        setCompletedWorkSessions(contextCompletedWorkSessions);
      if (showNotification !== contextShowNotification)
        setShowNotification(contextShowNotification);
      if (dailyGoal !== contextDailyGoal) setDailyGoal(contextDailyGoal);
      if (todayCompletedSessions !== contextTodayCompletedSessions)
        setTodayCompletedSessions(contextTodayCompletedSessions);
      if (currentSessionCount !== contextCurrentSessionCount)
        setCurrentSessionCount(contextCurrentSessionCount);
      if (volume !== contextVolume) setVolume(contextVolume);
      if (testMode !== contextTestMode) setTestMode(contextTestMode);
      if (testDuration !== contextTestDuration)
        setTestDuration(contextTestDuration);
      if (showTestControls !== contextShowTestControls)
        setShowTestControls(contextShowTestControls);
    }
  }, [toolState?.data]);

  // 테스트 모드가 변경될 때 타이머 시간 업데이트
  useEffect(() => {
    // 타이머가 활성화되지 않았고, 일시정지 상태도 아닐 때만 시간 업데이트
    // 또한 timeLeft가 0이 아닐 때만 업데이트 (모드 전환 직후 setTimeLeft가 덮어쓰지 않도록)
    if (!isActive && !isPaused && timeLeft === 0) {
      if (testMode) {
        // 테스트 모드일 때는 설정된 테스트 시간으로 변경
        updateTimeLeft(testDuration);
      } else {
        // 일반 모드일 때는 현재 모드에 맞는 시간으로 설정
        updateTimeLeft(
          mode === "work"
            ? workDuration * 60
            : mode === "break"
            ? breakDuration * 60
            : longBreakDuration * 60
        );
      }
    }
  }, [
    testMode,
    testDuration,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    isActive,
    isPaused,
    timeLeft,
  ]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 타이머 종료
            clearInterval(timerRef.current!);

            // 세션 기록
            const sessionDuration = testMode
              ? testDuration
              : mode === "work"
              ? workDuration * 60
              : mode === "break"
              ? breakDuration * 60
              : longBreakDuration * 60;

            // 세션 추가
            const updatedSessions = [
              ...sessions,
              {
                type: mode,
                duration: sessionDuration,
                timestamp: new Date(),
              },
            ];
            setSessions(updatedSessions);

            // 현재 모드를 저장 (새 모드로 전환하기 전)
            const currentMode = mode;

            // 작업 세션 완료 시 카운트 증가
            if (currentMode === "work") {
              // 작업 세션 카운트 증가
              const newCompletedSessions = completedWorkSessions + 1;
              setCompletedWorkSessions(newCompletedSessions);

              // 오늘 완료한 세션 수 업데이트
              const newTodayCompleted = todayCompletedSessions + 1;
              setTodayCompletedSessions(newTodayCompleted);

              // 모드 전환 - 현재 세션 번호를 기준으로 판단
              let nextMode: PomodoroMode;

              // 작업 세션이 workSessionsBeforeLongBreak까지 완료되면 긴 휴식으로 전환
              if (currentSessionCount >= workSessionsBeforeLongBreak) {
                nextMode = "longBreak";
                // Long Break 후에는 세션 번호가 1로 리셋됨
              } else {
                nextMode = "break";
              }

              // 새로운 모드에 맞는 시간 계산
              const nextModeTime = testMode
                ? testDuration
                : nextMode === "break"
                ? breakDuration * 60
                : longBreakDuration * 60;

              // 모드 변경과 시간 설정을 함께 처리
              updateMode(nextMode);
              setTimeLeft(nextModeTime); // 여기서는 로컬 상태만 업데이트 (중복 방지)
              // Context 상태 업데이트
              addHistoryEntry("pomodoro", "update", sessionDuration);
              updatePomodoroState();
            } else {
              // 휴식 모드(break 또는 longBreak)가 끝나면 work 모드로
              const nextModeTime = testMode ? testDuration : workDuration * 60;

              // 휴식 세션 종료 시 세션 번호 처리
              if (currentMode === "longBreak") {
                // 긴 휴식이 끝나면 세션 번호를 1로 리셋
                setCurrentSessionCount(1);
              } else if (currentMode === "break") {
                // 일반 휴식이 끝나면 세션 번호 증가
                const newSessionCount = currentSessionCount + 1;
                setCurrentSessionCount(newSessionCount);
              }

              // 모드 변경과 시간 설정을 함께 처리
              updateMode("work");
              setTimeLeft(nextModeTime); // 여기서는 로컬 상태만 업데이트 (중복 방지)
              // Context 상태 업데이트
              addHistoryEntry("pomodoro", "update", sessionDuration);
              updatePomodoroState();
            }

            if (soundEnabled && audioRef.current) {
              audioRef.current.volume = volume; // 볼륨 설정
              audioRef.current
                .play()
                .catch((e) => console.error("오디오 재생 실패:", e));
            }

            // 브라우저 알림
            if (
              showNotification &&
              typeof window !== "undefined" &&
              "Notification" in window
            ) {
              if (Notification.permission === "granted") {
                const title =
                  currentMode === "work"
                    ? "작업 시간 완료!"
                    : "휴식 시간 완료!";
                const body =
                  currentMode === "work"
                    ? "휴식 시간을 가지세요."
                    : "다시 작업할 시간입니다.";

                try {
                  // 기존 알림이 있으면 닫기
                  if (notificationRef.current) {
                    notificationRef.current.close();
                  }

                  // 새 알림 생성
                  notificationRef.current = new Notification(title, {
                    body,
                    icon: "/favicon.ico",
                    // 알림 클릭 시 포커스
                    requireInteraction: true,
                  });

                  // 알림 클릭 이벤트
                  notificationRef.current.onclick = () => {
                    window.focus();
                    if (notificationRef.current) {
                      notificationRef.current.close();
                    }
                  };

                  // 5초 후 알림 닫기
                  setTimeout(() => {
                    if (notificationRef.current) {
                      notificationRef.current.close();
                    }
                  }, 5000);
                } catch (e) {
                  console.error("알림 생성 실패:", e);
                }
              }
            }

            // 자동 시작 설정에 따라 다음 세션 시작 여부 결정
            updateIsActive(autoStartNextSession);
            return 0;
          }

          // 타이머가 1초씩 감소하는 일반적인 경우
          const newTimeLeft = prev - 1;

          // 매 업데이트마다 Context를 업데이트하지 않고,
          // 5초마다 한 번씩만 Context 업데이트 (성능 최적화)
          if (newTimeLeft % 5 === 0) {
            // setTimeout 없이 즉시 업데이트
            updatePomodoroState();
          }

          return newTimeLeft;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // 모드가 변경될 때 해당 모드에 맞는 시간으로 설정하는 useEffect
  useEffect(() => {
    // mode 변경 시 timeLeft가 0인 경우에만 새 모드에 맞게 시간 설정
    // 이렇게 하면 타이머 종료 시 이미 설정된 시간을 덮어쓰지 않음
    if (timeLeft === 0) {
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
    mode,
    testMode,
    testDuration,
    workDuration,
    breakDuration,
    longBreakDuration,
    timeLeft,
  ]);

  // 타이머 토글(시작/일시정지)
  const toggleTimer = () => {
    if (!isActive) {
      // 타이머 시작
      updateIsActive(true);
      updateIsPaused(false);
      // 타이머가 0이면 모드에 맞는 시간으로 초기화
      if (timeLeft === 0) {
        const initialTime = testMode
          ? testDuration
          : mode === "work"
          ? workDuration * 60
          : mode === "break"
          ? breakDuration * 60
          : longBreakDuration * 60;
        updateTimeLeft(initialTime);
      }
    } else if (isPaused) {
      // 일시정지 상태에서 재개
      updateIsPaused(false);
    } else {
      // 실행 중인 상태에서 일시정지
      updateIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // 상태 업데이트 적용
    updatePomodoroState();
  };

  // 타이머 리셋
  const resetTimer = () => {
    // 타이머 중지
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 현재 모드에 맞는 시간으로 초기화
    const initialTime = testMode
      ? testDuration
      : mode === "work"
      ? workDuration * 60
      : mode === "break"
      ? breakDuration * 60
      : longBreakDuration * 60;

    updateIsActive(false);
    updateIsPaused(false);
    updateTimeLeft(initialTime);

    // 상태 업데이트 적용
    updatePomodoroState();
  };

  // 시간 포맷 변환 (초 -> MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 진행 상태 계산 (0-100%)
  const calculateProgress = (): number => {
    const totalTime = testMode
      ? testDuration
      : mode === "work"
      ? workDuration * 60
      : mode === "break"
      ? breakDuration * 60
      : longBreakDuration * 60;

    // 총 시간이 0인 경우 예외 처리
    if (totalTime <= 0) return 0;

    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    return Math.min(Math.max(progress, 0), 100); // 0-100 범위 제한
  };

  // 작업 시간 변경 핸들러
  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setWorkDuration(value);

      // 현재 모드가 work이고 타이머가 활성화되지 않은 경우 시간 업데이트
      if (mode === "work" && !isActive) {
        updateTimeLeft(value * 60);
      } else {
        // 즉시 상태 업데이트
        updatePomodoroState();
      }
    }
  };

  // 휴식 시간 변경 핸들러
  const handleBreakDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setBreakDuration(value);

      // 현재 모드가 break이고 타이머가 활성화되지 않은 경우 시간 업데이트
      if (mode === "break" && !isActive) {
        updateTimeLeft(value * 60);
      } else {
        // 즉시 상태 업데이트
        updatePomodoroState();
      }
    }
  };

  // 긴 휴식 시간 변경 핸들러
  const handleLongBreakDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setLongBreakDuration(value);

      // 현재 모드가 longBreak이고 타이머가 활성화되지 않은 경우 시간 업데이트
      if (mode === "longBreak" && !isActive) {
        updateTimeLeft(value * 60);
      } else {
        // 즉시 상태 업데이트
        updatePomodoroState();
      }
    }
  };

  // 테스트 모드 시간 변경 핸들러
  const handleTestDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTestDuration(value);

      // 테스트 모드이고 타이머가 활성화되지 않은 경우 시간 업데이트
      if (testMode && !isActive) {
        updateTimeLeft(value);
      } else {
        // 즉시 상태 업데이트
        updatePomodoroState();
      }
    }
  };

  // 긴 휴식 전 작업 세션 수 변경 핸들러
  const handleWorkSessionsBeforeLongBreakChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setWorkSessionsBeforeLongBreak(numValue);
      // 상태 업데이트
      updatePomodoroState();
    }
  };

  // 일일 목표 세션 수 변경 핸들러
  const handleDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDailyGoal(value);
      // 상태 업데이트
      updatePomodoroState();
    }
  };

  // 테스트 모드 토글
  const toggleTestMode = () => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);

    // 테스트 모드 전환 시 타이머 시간 업데이트
    if (!isActive) {
      if (newTestMode) {
        // 테스트 모드로 전환: 설정된 테스트 시간으로
        updateTimeLeft(testDuration);
      } else {
        // 일반 모드로 전환: 현재 모드에 맞는 시간으로
        updateTimeLeft(
          mode === "work"
            ? workDuration * 60
            : mode === "break"
            ? breakDuration * 60
            : longBreakDuration * 60
        );
      }
    } else {
      // 즉시 상태 업데이트
      updatePomodoroState();
    }
  };

  // 타이머 빨리 감기 (테스트용)
  const fastForwardTimer = () => {
    if (isActive) {
      // 타이머를 5초 남기고 빨리감기
      setTimeLeft(5);
    }
  };

  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      console.log("알림 권한 요청 시작...");

      // 권한 요청 전 현재 상태 로깅
      console.log("요청 전 권한 상태:", Notification.permission);

      Notification.requestPermission()
        .then((permission) => {
          console.log("권한 요청 결과:", permission);

          // 권한 상태 업데이트
          setNotificationPermission(permission);

          if (permission === "granted") {
            setShowNotification(true);
            // 테스트 알림 표시
            try {
              const notification = new Notification("알림 테스트", {
                body: "알림이 성공적으로 활성화되었습니다.",
                icon: "/favicon.ico",
              });
              console.log("테스트 알림 생성 성공");
            } catch (error) {
              console.error("테스트 알림 생성 실패:", error);
            }
          } else if (permission === "denied") {
            alert(
              "알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 변경할 수 있습니다."
            );
          } else {
            // default 상태 처리
            console.log("알림 권한이 결정되지 않았습니다.");
          }
        })
        .catch((error) => {
          console.error("알림 권한 요청 중 오류 발생:", error);
          alert("알림 권한을 요청하는 중 오류가 발생했습니다.");
        });
    } else {
      console.log("이 브라우저는 알림을 지원하지 않습니다.");
      alert("이 브라우저는 알림 기능을 지원하지 않습니다.");
    }
  };

  const openBrowserSettings = () => {
    // 브라우저별 알림 설정 페이지 안내
    const isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
    const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
    const isEdge = navigator.userAgent.indexOf("Edg") !== -1;
    const isSafari =
      navigator.userAgent.indexOf("Safari") !== -1 &&
      navigator.userAgent.indexOf("Chrome") === -1;

    let message = "브라우저 설정에서 알림 권한을 변경하려면:\n\n";

    if (isChrome || isEdge) {
      message += "1. 주소창 왼쪽의 자물쇠(또는 정보) 아이콘을 클릭하세요.\n";
      message += "2. '사이트 설정' 또는 '권한'을 클릭하세요.\n";
      message += "3. '알림' 설정을 '허용'으로 변경하세요.";
    } else if (isFirefox) {
      message += "1. 주소창 왼쪽의 정보 아이콘을 클릭하세요.\n";
      message += "2. '권한 편집' 버튼을 클릭하세요.\n";
      message += "3. '알림 보내기' 설정을 '허용'으로 변경하세요.";
    } else if (isSafari) {
      message += "1. Safari 메뉴에서 '환경설정'을 클릭하세요.\n";
      message += "2. '웹사이트' 탭을 선택하세요.\n";
      message +=
        "3. 왼쪽에서 '알림'을 선택하고 이 웹사이트의 권한을 '허용'으로 변경하세요.";
    } else {
      message +=
        "브라우저의 설정 메뉴에서 알림 권한을 찾아 이 웹사이트에 대한 권한을 '허용'으로 변경하세요.";
    }

    alert(message);
  };

  // 포모도로 기법 단계
  const pomodoroSteps = [
    {
      step: 1,
      title: "작업 시간 (25분)",
      description:
        "집중해서 한 가지 작업에만 집중하세요. 방해 요소를 모두 제거하고 타이머가 끝날 때까지 작업에 몰입합니다.",
    },
    {
      step: 2,
      title: "짧은 휴식 (5분)",
      description:
        "작업 세션이 끝나면 짧은 휴식을 취하세요. 스트레칭, 물 마시기, 잠시 걷기 등 가벼운 활동을 하세요.",
    },
    {
      step: 3,
      title: "반복",
      description: "4번의 작업 세션을 완료할 때까지 1-2단계를 반복합니다.",
    },
    {
      step: 4,
      title: "긴 휴식 (15-30분)",
      description:
        "4번의 작업 세션 후에는 더 긴 휴식을 취하세요. 이 시간은 뇌가 정보를 처리하고 재충전하는 데 중요합니다.",
    },
  ];

  // 모드에 따른 색상 설정
  const modeColors = {
    work: {
      bg: "bg-red-500",
      text: "text-red-500",
      border: "border-red-500",
      light: "bg-red-100 dark:bg-red-900/30",
      badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    break: {
      bg: "bg-green-500",
      text: "text-green-500",
      border: "border-green-500",
      light: "bg-green-100 dark:bg-green-900/30",
      badge:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    longBreak: {
      bg: "bg-blue-500",
      text: "text-blue-500",
      border: "border-blue-500",
      light: "bg-blue-100 dark:bg-blue-900/30",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
  };

  const currentColor = modeColors[mode];

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-300">
          집중력 향상을 위한 포모도로 타이머
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          포모도로 기법을 활용하여 작업 효율성을 높이고 번아웃을 방지하세요.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="md:w-1/2">
          <Card className="w-full bg-white dark:bg-gray-900 border-red-200 dark:border-red-800">
            <CardHeader className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-red-500" />
                  <CardTitle>Pomodoro Timer</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 ${
                            testMode
                              ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                              : ""
                          }`}
                          onClick={() => setShowTestControls(!showTestControls)}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          테스트 모드
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>타이머를 빠르게 테스트하기 위한 모드입니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardDescription>
                집중력 향상을 위한 포모도로 타이머입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {showTestControls && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300">
                      테스트 모드 설정
                    </h3>
                    <Switch
                      checked={testMode}
                      onCheckedChange={toggleTestMode}
                    />
                  </div>

                  {testMode && (
                    <div className="space-y-3">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <Label htmlFor="test-duration" className="text-xs">
                            테스트 타이머 시간 (초)
                          </Label>
                          <Input
                            id="test-duration"
                            type="number"
                            min="1"
                            value={testDuration}
                            onChange={handleTestDurationChange}
                            className="h-8"
                            disabled={isActive}
                          />
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={fastForwardTimer}
                                disabled={!isActive}
                              >
                                <FastForward className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>타이머를 5초로 빨리감기</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3 inline-block mr-1" />
                        테스트 모드에서는 모든 타이머가 {testDuration}초로
                        설정됩니다.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Tabs defaultValue="timer" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="timer">Timer</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="timer" className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="text-lg font-medium">
                          {mode === "work"
                            ? "Work Time"
                            : mode === "break"
                            ? "Break Time"
                            : "Long Break"}
                        </h3>
                        <Badge variant="outline" className={currentColor.badge}>
                          {currentSessionCount} / {workSessionsBeforeLongBreak}
                        </Badge>
                        {testMode && (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          >
                            테스트 모드
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mode === "work"
                          ? "Focus on your task"
                          : mode === "break"
                          ? "Take a short break"
                          : "Take a long break"}
                      </p>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 dark:text-gray-700"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={`${
                              mode === "work"
                                ? "text-red-500"
                                : mode === "break"
                                ? "text-green-500"
                                : "text-blue-500"
                            }`}
                            strokeWidth="4"
                            strokeDasharray={283}
                            strokeDashoffset={
                              283 - (283 * calculateProgress()) / 100
                            }
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                      </div>
                      <span className="text-4xl font-bold">
                        {formatTime(timeLeft)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTimer}
                        className={`h-10 w-10 ${
                          isActive
                            ? "bg-red-50 dark:bg-red-950/20"
                            : "bg-green-50 dark:bg-green-950/20"
                        }`}
                      >
                        {isActive ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resetTimer}
                        className="h-10 w-10"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="h-10 w-10"
                      >
                        {soundEnabled ? (
                          <Volume2 className="h-5 w-5" />
                        ) : (
                          <VolumeX className="h-5 w-5" />
                        )}
                      </Button>
                      {testMode && isActive && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={fastForwardTimer}
                          className="h-10 w-10 bg-amber-50 dark:bg-amber-950/20"
                        >
                          <FastForward className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    {/* 세션 진행 상태 표시 */}
                    <div className="w-full flex justify-center gap-1">
                      {Array.from({ length: workSessionsBeforeLongBreak }).map(
                        (_, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${
                              // 현재 세션 번호에 맞게 표시 (index는 0부터, 세션은 1부터 시작)
                              index < currentSessionCount
                                ? "bg-red-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        )
                      )}
                    </div>

                    {/* 일일 목표 진행 상태 */}
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>오늘의 목표</span>
                        <span>
                          {todayCompletedSessions} / {dailyGoal} 세션
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (todayCompletedSessions / dailyGoal) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 알림 권한 요청 */}
                    {isClient &&
                      showNotification &&
                      typeof window !== "undefined" &&
                      "Notification" in window && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>
                            {notificationPermission === "default"
                              ? "알림 권한이 필요합니다"
                              : notificationPermission === "denied"
                              ? "알림 권한이 거부되었습니다"
                              : "알림이 활성화되었습니다"}
                          </AlertTitle>
                          <AlertDescription>
                            {notificationPermission === "default" ? (
                              <>
                                <p className="mb-2">
                                  타이머 완료 시 브라우저 알림을 받으려면 알림
                                  권한을 허용해주세요.
                                  <span className="block mt-1 text-blue-500">
                                    (알림 권한이 없어도 알림음은 정상적으로
                                    재생됩니다.)
                                  </span>
                                </p>
                                <Button
                                  size="sm"
                                  onClick={requestNotificationPermission}
                                >
                                  알림 허용하기
                                </Button>
                              </>
                            ) : notificationPermission === "denied" ? (
                              <>
                                <p className="mb-2">
                                  브라우저에서 알림이 차단되어 있습니다.
                                  브라우저 설정에서 알림 권한을 변경해주세요.
                                  <span className="block mt-1 text-blue-500">
                                    (알림 권한이 없어도 알림음은 정상적으로
                                    재생됩니다.)
                                  </span>
                                </p>
                                <Button size="sm" onClick={openBrowserSettings}>
                                  브라우저 설정 안내
                                </Button>
                              </>
                            ) : (
                              <p>타이머 완료 시 알림을 받을 수 있습니다.</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-duration">작업 시간 (분)</Label>
                      <Input
                        id="work-duration"
                        type="number"
                        min="1"
                        value={workDuration}
                        onChange={handleWorkDurationChange}
                        disabled={isActive}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="break-duration">
                        짧은 휴식 시간 (분)
                      </Label>
                      <Input
                        id="break-duration"
                        type="number"
                        min="1"
                        value={breakDuration}
                        onChange={handleBreakDurationChange}
                        disabled={isActive}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="long-break-duration">
                        긴 휴식 시간 (분)
                      </Label>
                      <Input
                        id="long-break-duration"
                        type="number"
                        min="1"
                        value={longBreakDuration}
                        onChange={handleLongBreakDurationChange}
                        disabled={isActive}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessions-before-long-break">
                        긴 휴식 전 작업 세션 수
                      </Label>
                      <Select
                        value={workSessionsBeforeLongBreak.toString()}
                        onValueChange={handleWorkSessionsBeforeLongBreakChange}
                        disabled={isActive}
                      >
                        <SelectTrigger id="sessions-before-long-break">
                          <SelectValue placeholder="세션 수 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 세션</SelectItem>
                          <SelectItem value="3">3 세션</SelectItem>
                          <SelectItem value="4">4 세션</SelectItem>
                          <SelectItem value="5">5 세션</SelectItem>
                          <SelectItem value="6">6 세션</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="daily-goal">일일 목표 세션 수</Label>
                      <Input
                        id="daily-goal"
                        type="number"
                        min="1"
                        value={dailyGoal}
                        onChange={handleDailyGoalChange}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="auto-start" className="cursor-pointer">
                        세션 완료 후 자동 시작
                      </Label>
                      <Switch
                        id="auto-start"
                        checked={autoStartNextSession}
                        onCheckedChange={setAutoStartNextSession}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label
                        htmlFor="show-notification"
                        className="cursor-pointer"
                      >
                        브라우저 알림 표시
                      </Label>
                      <Switch
                        id="show-notification"
                        checked={showNotification}
                        onCheckedChange={setShowNotification}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="sound-enabled" className="cursor-pointer">
                        알림음 재생
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="sound-enabled"
                          checked={soundEnabled}
                          onCheckedChange={setSoundEnabled}
                        />
                        {soundEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.volume = volume;
                                audioRef.current
                                  .play()
                                  .catch((e) =>
                                    console.error("오디오 테스트 실패:", e)
                                  );
                              }
                            }}
                          >
                            테스트
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label
                        htmlFor="sound-volume"
                        className="flex justify-between"
                      >
                        <span>알림음 볼륨</span>
                        <span>{Math.round(volume * 100)}%</span>
                      </Label>
                      <Slider
                        id="sound-volume"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[volume]}
                        onValueChange={(value) => {
                          setVolume(value[0]);
                          // 볼륨 변경 시 미리 들어보기
                          if (soundEnabled && audioRef.current) {
                            audioRef.current.volume = value[0];
                            audioRef.current.currentTime = 0;
                            audioRef.current
                              .play()
                              .catch((e) =>
                                console.error("오디오 미리듣기 실패:", e)
                              );
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWorkDuration(25);
                          setBreakDuration(5);
                          setLongBreakDuration(15);
                          setWorkSessionsBeforeLongBreak(4);
                          setAutoStartNextSession(true);
                          if (!isActive) {
                            setTimeLeft(
                              mode === "work"
                                ? 25 * 60
                                : mode === "break"
                                ? 5 * 60
                                : 15 * 60
                            );
                          }
                        }}
                        disabled={isActive}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        기본값으로 재설정
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent
                  value="history"
                  className="h-[300px] overflow-y-auto"
                >
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      세션 기록이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            session.type === "work"
                              ? "bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900"
                              : session.type === "break"
                              ? "bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900"
                              : "bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {session.type === "work"
                                ? "작업 세션"
                                : session.type === "break"
                                ? "짧은 휴식"
                                : "긴 휴식"}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(session.duration)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {session.timestamp.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="stats" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">오늘의 통계</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            완료한 작업 세션
                          </div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {todayCompletedSessions}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            집중 시간
                          </div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {Math.floor(
                              (todayCompletedSessions * workDuration) / 60
                            )}
                            시간 {(todayCompletedSessions * workDuration) % 60}
                            분
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">목표 달성률</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>일일 목표</span>
                          <span>
                            {Math.min(
                              100,
                              Math.round(
                                (todayCompletedSessions / dailyGoal) * 100
                              )
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-red-500 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (todayCompletedSessions / dailyGoal) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">현재 세션</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">현재 세션 번호</span>
                          <span className="text-sm font-medium">
                            {currentSessionCount} /{" "}
                            {workSessionsBeforeLongBreak}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">다음 긴 휴식까지</span>
                          <span className="text-sm font-medium">
                            {workSessionsBeforeLongBreak -
                              currentSessionCount +
                              1}{" "}
                            세션
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6">
              <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
                {mode === "work" ? (
                  <p>집중 모드: 작업에 집중하세요!</p>
                ) : mode === "break" ? (
                  <p>짧은 휴식 모드: 잠시 휴식을 취하세요.</p>
                ) : (
                  <p>긴 휴식 모드: 충분한 휴식을 취하세요.</p>
                )}
                {testMode && (
                  <p className="text-amber-500 dark:text-amber-400 mt-1">
                    테스트 모드가 활성화되었습니다.
                  </p>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-1/2 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Info className="h-4 w-4 text-red-600 dark:text-red-300" />
              </div>
              <h3 className="font-medium">포모도로 기법이란?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              포모도로 기법은 1980년대 프란체스코 시릴로가 개발한 시간 관리
              방법론입니다. 25분 작업과 5분 휴식을 반복하여 집중력과 생산성을
              높이는 기법입니다.
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-medium">
                  포모도로 기법 단계
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {pomodoroSteps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-red-600 dark:text-red-300">
                            {step.step}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{step.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-medium">
                  효과적인 사용 팁
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>작업 시작 전에 할 일 목록을 작성하세요.</li>
                    <li>각 포모도로 세션에서 한 가지 작업에만 집중하세요.</li>
                    <li>
                      휴식 시간에는 정말로 휴식을 취하세요. 화면을 보는 것을
                      피하고 몸을 움직이는 것이 좋습니다.
                    </li>
                    <li>
                      하루에 완료할 수 있는 포모도로 세션 수를 파악하고 그에
                      맞게 작업을 계획하세요.
                    </li>
                    <li>
                      방해 요소가 생기면 기록해두고 다음 휴식 시간에 처리하세요.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-medium">
                  새로운 기능 안내
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <span className="font-medium">긴 휴식 기능</span>: 설정한
                      작업 세션 수 이후에 자동으로 긴 휴식 시간이 제공됩니다.
                    </li>
                    <li>
                      <span className="font-medium">자동 시작</span>: 세션이
                      끝난 후 다음 세션을 자동으로 시작할 수 있습니다.
                    </li>
                    <li>
                      <span className="font-medium">브라우저 알림</span>: 세션이
                      끝나면 브라우저 알림을 받을 수 있습니다.
                    </li>
                    <li>
                      <span className="font-medium">일일 목표</span>: 하루에
                      완료하고 싶은 작업 세션 수를 설정하고 진행 상황을 확인할
                      수 있습니다.
                    </li>
                    <li>
                      <span className="font-medium">통계 기능</span>: 오늘
                      완료한 세션 수와 집중 시간을 확인할 수 있습니다.
                    </li>
                    <li>
                      <span className="font-medium">테스트 모드</span>: 포모도로
                      타이머의 기능을 빠르게 테스트할 수 있는 모드입니다. 타이머
                      시간을 초 단위로 설정하여 전체 흐름을 확인할 수 있습니다.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-medium">
                  테스트 모드 사용법
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      테스트 모드는 포모도로 타이머의 기능을 빠르게 확인하기
                      위한 임시 기능입니다:
                    </p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>
                        우측 상단의 '테스트 모드' 버튼을 클릭하여 테스트 설정을
                        표시합니다.
                      </li>
                      <li>테스트 모드 스위치를 켜서 활성화합니다.</li>
                      <li>
                        원하는 테스트 시간을 초 단위로 설정합니다 (기본값:
                        10초).
                      </li>
                      <li>타이머를 시작하면 설정한 시간으로 작동합니다.</li>
                      <li>
                        타이머가 실행 중일 때 빨리감기 버튼을 클릭하면 타이머가
                        5초로 줄어듭니다.
                      </li>
                      <li>
                        테스트가 끝나면 테스트 모드를 비활성화하여 일반 모드로
                        돌아갑니다.
                      </li>
                    </ol>
                    <p className="mt-2 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3 inline-block mr-1" />
                      테스트 모드에서는 모든 타이머(작업, 휴식, 긴 휴식)가
                      동일한 시간으로 설정됩니다.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                </div>
                <h3 className="font-medium">왜 포모도로인가요?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                '포모도로'는 이탈리아어로 토마토를 의미합니다. 개발자가 주방
                타이머로 토마토 모양의 타이머를 사용했기 때문에 이 이름이
                붙었습니다. 이 기법은 집중력 향상, 작업 효율성 증가, 번아웃
                방지에 효과적입니다.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-red-600 dark:text-red-300" />
                </div>
                <h3 className="font-medium">알고 계셨나요?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                연구에 따르면 인간의 집중력은 약 25분 후에 자연스럽게 감소하기
                시작합니다. 포모도로 기법의 25분 작업 시간은 이러한 인지 과학
                연구를 기반으로 설계되었습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
