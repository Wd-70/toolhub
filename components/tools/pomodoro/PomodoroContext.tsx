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

  // 테스트 모드 또는 모드가 변경될 때 타이머 시간 업데이트
  // 주의: 이 useEffect는 타이머가 실행 중이 아닐 때만 작동함
  useEffect(() => {
    // 타이머가 실행 중이 아닐 때만 시간 재설정
    if (!isActive) {
      console.debug(
        `모드/테스트 변경 감지: ${mode}, 테스트모드=${
          testMode ? "활성" : "비활성"
        }`
      );

      // 현재 모드에 맞는 시간 계산
      const newTime = testMode
        ? testDuration
        : mode === "work"
        ? workDuration * 60
        : mode === "break"
        ? breakDuration * 60
        : longBreakDuration * 60;

      console.debug(`타이머 시간 재설정: ${newTime}초`);
      setTimeLeft(newTime);
    }
  }, [
    // 의존성 배열에서 중요한 것만 포함 (isActive는 제외)
    testMode,
    testDuration,
    mode,
    workDuration,
    breakDuration,
    longBreakDuration,
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

            // 현재 모드 저장 (이후 로직에서 사용)
            const currentMode = mode;

            // 다음 모드와 시간을 결정하는 함수
            const getNextModeAndTime = () => {
              // 작업 세션 완료시
              if (currentMode === "work") {
                // 완료된 세션 수 증가
                const newCompletedSessions = completedWorkSessions + 1;

                // 다음 모드 결정
                let nextMode: TimerMode;
                if (
                  newCompletedSessions > 0 &&
                  newCompletedSessions % workSessionsBeforeLongBreak === 0
                ) {
                  nextMode = "longBreak";
                } else {
                  nextMode = "break";
                }

                // 다음 모드에 맞는 시간 계산
                const nextTime = testMode
                  ? testDuration
                  : nextMode === "break"
                  ? breakDuration * 60
                  : longBreakDuration * 60;

                return {
                  mode: nextMode,
                  time: nextTime,
                  completedSessions: newCompletedSessions,
                  todayCompleted: todayCompletedSessions + 1,
                };
              }
              // 휴식 세션 완료시
              else {
                // 항상 작업 모드로 전환
                const nextTime = testMode ? testDuration : workDuration * 60;
                return {
                  mode: "work",
                  time: nextTime,
                  completedSessions: completedWorkSessions,
                  todayCompleted: todayCompletedSessions,
                };
              }
            };

            // 다음 모드와 시간 계산
            const {
              mode: nextMode,
              time: nextTime,
              completedSessions: newCompletedSessions,
              todayCompleted: newTodayCompleted,
            } = getNextModeAndTime();

            // 작업 세션 완료 시 통계 업데이트
            if (currentMode === "work") {
              // 완료된 세션 수 업데이트
              setCompletedWorkSessions(newCompletedSessions);
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
            }

            // 중요: 모드 변경은 바로 하지만, 타이머 시간은 useRef로 먼저 저장
            // 이렇게 하면 모드 변경 감지 useEffect에서 올바른 시간을 설정할 수 있음

            // 최종 상태 변경 순서:
            // 1. 먼저 isActive를 false로 설정 (타이머 일시 정지)
            // 2. 모드 변경
            // 3. 마지막으로 자동 시작 여부에 따라 isActive 설정

            // 타이머를 먼저 정지 (다른 상태 변경 전)
            setIsActive(false);

            // 그 다음 모드 변경
            setMode(nextMode as TimerMode);

            // 약간의 딜레이 후 타이머 시간 설정 및 자동 시작 처리
            setTimeout(() => {
              // 타이머 시간 설정
              setTimeLeft(nextTime);

              // 자동 시작 설정에 따라 타이머 시작
              if (autoStartNextSession) {
                setIsActive(true);
              }
            }, 100);

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

            // 알림 처리 완료
            // 자동 시작은 이미 위에서 처리했으므로 여기서는 생략

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
    // 먼저 타이머 중지
    setIsActive(false);

    // 작업 세션 카운트 초기화
    setCompletedWorkSessions(0);

    // 모드 변경 (이후 useEffect에서 시간 설정됨)
    setMode("work");

    // 시간은 별도로 설정 (useEffect가 감지하지 못하는 경우를 대비)
    setTimeout(() => {
      const time = testMode ? testDuration : workDuration * 60;
      console.debug(`타이머 리셋: ${time}초`);
      setTimeLeft(time);
    }, 50);
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
    setTimeLeft,
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
