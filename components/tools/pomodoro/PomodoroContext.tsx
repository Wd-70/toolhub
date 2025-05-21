"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

export type TimerMode = "work" | "break" | "longBreak";

export type SessionData = {
  type: TimerMode;
  duration: number;
  timestamp: Date;
};

type PomodoroContextType = {
  // 타이머 상태
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  workSessionsBeforeLongBreak: number;
  completedWorkSessions: number;
  todayCompletedSessions: number;
  sessions: SessionData[];
  dailyGoal: number;

  // 설정
  soundEnabled: boolean;
  volume: number;
  autoStartNextSession: boolean;
  showNotification: boolean;
  notificationPermission: "default" | "denied" | "granted";

  // 테스트 모드
  testMode: boolean;
  testDuration: number;
  showTestControls: boolean;

  // 타이머 제어 함수
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
  calculateProgress: () => number;
  fastForwardTimer: () => void;

  // 설정 변경 함수
  setMode: (mode: TimerMode) => void;
  setWorkDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setWorkSessionsBeforeLongBreak: (count: number) => void;
  setDailyGoal: (goal: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setAutoStartNextSession: (auto: boolean) => void;
  setShowNotification: (show: boolean) => void;

  // 테스트 모드 함수
  toggleTestMode: () => void;
  setShowTestControls: (show: boolean) => void;
  setTestDuration: (duration: number) => void;

  // 알림 관련 함수
  requestNotificationPermission: () => void;
  openBrowserSettings: () => void;

  // 이벤트 핸들러
  handleWorkDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBreakDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLongBreakDurationChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleTestDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWorkSessionsBeforeLongBreakChange: (value: string) => void;
  handleDailyGoalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error(
      "usePomodoroContext must be used within a PomodoroProvider"
    );
  }
  return context;
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 타이머 상태
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [workDuration, setWorkDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoStartNextSession, setAutoStartNextSession] =
    useState<boolean>(true);
  const [workSessionsBeforeLongBreak, setWorkSessionsBeforeLongBreak] =
    useState<number>(4);
  const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [dailyGoal, setDailyGoal] = useState<number>(8);
  const [todayCompletedSessions, setTodayCompletedSessions] =
    useState<number>(0);
  const [notificationPermission, setNotificationPermission] = useState<
    "default" | "denied" | "granted"
  >("default");
  const [volume, setVolume] = useState<number>(0.5); // 기본 볼륨 50%

  // 테스트 모드 관련 상태
  const [testMode, setTestMode] = useState<boolean>(false);
  const [testDuration, setTestDuration] = useState<number>(10); // 테스트 모드에서의 기본 시간(초)
  const [showTestControls, setShowTestControls] = useState<boolean>(false);

  // 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<Notification | null>(null);

  // 타이머 초기화 및 정리
  useEffect(() => {
    // 오디오 요소 생성
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3");
    }

    // 알림 권한 확인 및 상태 설정
    if (typeof window !== "undefined" && "Notification" in window) {
      // 권한 상태를 직접 확인하여 설정
      try {
        const permission = Notification.permission;
        setNotificationPermission(
          permission as "default" | "denied" | "granted"
        );
      } catch (error) {
        console.error("알림 권한 확인 중 오류:", error);
        setNotificationPermission("default");
      }
    }

    // 오늘 완료한 세션 수 로드
    const loadTodayCompletedSessions = () => {
      if (typeof window !== "undefined") {
        const today = new Date().toLocaleDateString();
        const savedData = localStorage.getItem("pomodoroStats");

        if (savedData) {
          try {
            const stats = JSON.parse(savedData);
            if (stats.date === today) {
              setTodayCompletedSessions(stats.completedSessions || 0);
            } else {
              // 날짜가 다르면 초기화
              localStorage.setItem(
                "pomodoroStats",
                JSON.stringify({
                  date: today,
                  completedSessions: 0,
                })
              );
            }
          } catch (e) {
            console.error("저장된 데이터를 불러오는 중 오류 발생:", e);
          }
        } else {
          localStorage.setItem(
            "pomodoroStats",
            JSON.stringify({
              date: today,
              completedSessions: 0,
            })
          );
        }
      }
    };

    loadTodayCompletedSessions();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 테스트 모드가 변경될 때 타이머 시간 업데이트
  useEffect(() => {
    if (!isActive) {
      if (testMode) {
        // 테스트 모드일 때는 설정된 테스트 시간으로 변경
        setTimeLeft(testDuration);
      } else {
        // 일반 모드일 때는 현재 모드에 맞는 시간으로 설정
        setTimeLeft(
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
  ]);

  // 타이머 작동 로직
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

            setSessions((prev) => [
              ...prev,
              {
                type: mode,
                duration: sessionDuration,
                timestamp: new Date(),
              },
            ]);

            // 작업 세션 완료 시 카운트 증가
            if (mode === "work") {
              // 먼저 완료된 세션 수를 증가시킨 후
              const newCompletedSessions = completedWorkSessions + 1;
              setCompletedWorkSessions(newCompletedSessions);

              // 오늘 완료한 세션 수 업데이트
              const newTodayCompleted = todayCompletedSessions + 1;
              setTodayCompletedSessions(newTodayCompleted);

              // 로컬 스토리지에 저장
              if (typeof window !== "undefined") {
                const today = new Date().toLocaleDateString();
                localStorage.setItem(
                  "pomodoroStats",
                  JSON.stringify({
                    date: today,
                    completedSessions: newTodayCompleted,
                  })
                );
              }

              // 모드 전환 - 증가된 세션 수를 기준으로 판단
              // 첫 번째 세션 후에는 newCompletedSessions가 1이므로 긴 휴식으로 가지 않음
              if (
                newCompletedSessions > 0 &&
                newCompletedSessions % workSessionsBeforeLongBreak === 0
              ) {
                setMode("longBreak");
              } else {
                setMode("break");
              }
            } else {
              // 휴식 후에는 항상 작업 세션
              setMode("work");
            }

            // 알림음 재생
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
                  mode === "work" ? "작업 시간 완료!" : "휴식 시간 완료!";
                const body =
                  mode === "work"
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

            // 새 모드에 맞는 시간 설정
            const newTime = testMode
              ? testDuration
              : mode === "work"
              ? workDuration * 60
              : mode === "break"
              ? breakDuration * 60
              : longBreakDuration * 60;

            setTimeLeft(newTime);

            // 자동 시작 설정에 따라 다음 세션 시작 여부 결정
            setIsActive(autoStartNextSession);

            return 0;
          }
          return prev - 1;
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
  }, [
    isActive,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
    soundEnabled,
    autoStartNextSession,
    completedWorkSessions,
    workSessionsBeforeLongBreak,
    showNotification,
    todayCompletedSessions,
    testMode,
    testDuration,
    volume,
  ]);

  // 타이머 제어 함수
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setTimeLeft(testMode ? testDuration : workDuration * 60);
    setCompletedWorkSessions(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateProgress = (): number => {
    const totalSeconds = testMode
      ? testDuration
      : mode === "work"
      ? workDuration * 60
      : mode === "break"
      ? breakDuration * 60
      : longBreakDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // 이벤트 핸들러
  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWorkDuration(value);
      if (mode === "work" && !isActive && !testMode) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleBreakDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBreakDuration(value);
      if (mode === "break" && !isActive && !testMode) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleLongBreakDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLongBreakDuration(value);
      if (mode === "longBreak" && !isActive && !testMode) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleTestDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTestDuration(value);
      if (!isActive && testMode) {
        setTimeLeft(value);
      }
    }
  };

  const handleWorkSessionsBeforeLongBreakChange = (value: string) => {
    const numValue = Number.parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setWorkSessionsBeforeLongBreak(numValue);
    }
  };

  const handleDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDailyGoal(value);
    }
  };

  // 테스트 모드 함수
  const toggleTestMode = () => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);

    // 테스트 모드 전환 시 타이머 리셋
    if (isActive) {
      setIsActive(false);
    }

    // 테스트 모드에 맞는 시간 설정
    setTimeLeft(
      newTestMode
        ? testDuration
        : mode === "work"
        ? workDuration * 60
        : mode === "break"
        ? breakDuration * 60
        : longBreakDuration * 60
    );
  };

  // 타이머 빨리 감기 (테스트용)
  const fastForwardTimer = () => {
    if (isActive) {
      // 타이머를 5초 남기고 빨리감기
      setTimeLeft(5);
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
        .then((permission) => {
          setNotificationPermission(
            permission as "default" | "denied" | "granted"
          );

          if (permission === "granted") {
            setShowNotification(true);
            // 테스트 알림 표시
            try {
              const notification = new Notification("알림 테스트", {
                body: "알림이 성공적으로 활성화되었습니다.",
                icon: "/favicon.ico",
              });
            } catch (error) {
              console.error("테스트 알림 생성 실패:", error);
            }
          } else if (permission === "denied") {
            alert(
              "알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 변경할 수 있습니다."
            );
          }
        })
        .catch((error) => {
          console.error("알림 권한 요청 중 오류 발생:", error);
          alert("알림 권한을 요청하는 중 오류가 발생했습니다.");
        });
    } else {
      alert("이 브라우저는 알림 기능을 지원하지 않습니다.");
    }
  };

  // 브라우저 설정 안내
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

  const contextValue: PomodoroContextType = {
    // 타이머 상태
    mode,
    timeLeft,
    isActive,
    workDuration,
    breakDuration,
    longBreakDuration,
    workSessionsBeforeLongBreak,
    completedWorkSessions,
    todayCompletedSessions,
    sessions,
    dailyGoal,

    // 설정
    soundEnabled,
    volume,
    autoStartNextSession,
    showNotification,
    notificationPermission,

    // 테스트 모드
    testMode,
    testDuration,
    showTestControls,

    // 타이머 제어 함수
    toggleTimer,
    resetTimer,
    formatTime,
    calculateProgress,
    fastForwardTimer,

    // 설정 변경 함수
    setMode,
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setWorkSessionsBeforeLongBreak,
    setDailyGoal,
    setSoundEnabled,
    setVolume,
    setAutoStartNextSession,
    setShowNotification,

    // 테스트 모드 함수
    toggleTestMode,
    setShowTestControls,
    setTestDuration,

    // 알림 관련 함수
    requestNotificationPermission,
    openBrowserSettings,

    // 이벤트 핸들러
    handleWorkDurationChange,
    handleBreakDurationChange,
    handleLongBreakDurationChange,
    handleTestDurationChange,
    handleWorkSessionsBeforeLongBreakChange,
    handleDailyGoalChange,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};
