"use client";

import { useState, useEffect, useCallback } from "react";

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  workSessionsBeforeLongBreak: number;
  dailyGoal: number;
  soundEnabled: boolean;
  volume: number;
  showNotification: boolean;
  globalModeEnabled: boolean;
  showTestControls: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  workSessionsBeforeLongBreak: 4,
  dailyGoal: 8,
  soundEnabled: true,
  volume: 0.5,
  showNotification: true,
  globalModeEnabled: true,
  showTestControls: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);

  // 설정 로드
  useEffect(() => {
    const loadSettings = () => {
      if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem("pomodoroSettings");

        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings((prevSettings) => ({
              ...prevSettings,
              ...parsedSettings,
            }));
          } catch (e) {
            console.error("설정을 불러오는 중 오류 발생:", e);
            // 오류 발생 시 기본값으로 설정
            setSettings(DEFAULT_SETTINGS);
          }
        }
      }
    };

    loadSettings();
  }, []);

  // 설정 저장
  const saveSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "pomodoroSettings",
          JSON.stringify(updatedSettings)
        );
      }

      return updatedSettings;
    });
  }, []);

  // 개별 설정 변경 함수들
  const setWorkDuration = useCallback(
    (duration: number) => {
      saveSettings({ workDuration: duration });
    },
    [saveSettings]
  );

  const setBreakDuration = useCallback(
    (duration: number) => {
      saveSettings({ breakDuration: duration });
    },
    [saveSettings]
  );

  const setLongBreakDuration = useCallback(
    (duration: number) => {
      saveSettings({ longBreakDuration: duration });
    },
    [saveSettings]
  );

  const setWorkSessionsBeforeLongBreak = useCallback(
    (count: number) => {
      saveSettings({ workSessionsBeforeLongBreak: count });
    },
    [saveSettings]
  );

  const setDailyGoal = useCallback(
    (goal: number) => {
      saveSettings({ dailyGoal: goal });
    },
    [saveSettings]
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      saveSettings({ soundEnabled: enabled });
    },
    [saveSettings]
  );

  const setVolume = useCallback(
    (volume: number) => {
      saveSettings({ volume: volume });
    },
    [saveSettings]
  );

  const setShowNotification = useCallback(
    (show: boolean) => {
      saveSettings({ showNotification: show });
    },
    [saveSettings]
  );

  const setGlobalModeEnabled = useCallback(
    (enabled: boolean) => {
      saveSettings({ globalModeEnabled: enabled });
    },
    [saveSettings]
  );

  const setShowTestControls = useCallback(
    (show: boolean) => {
      saveSettings({ showTestControls: show });
    },
    [saveSettings]
  );

  // 설정 초기화
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // 설정 내보내기
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // 설정 가져오기
  const importSettings = useCallback(
    (jsonSettings: string) => {
      try {
        const parsedSettings = JSON.parse(jsonSettings);
        saveSettings(parsedSettings);
        return true;
      } catch (e) {
        console.error("설정을 가져오는 중 오류 발생:", e);
        return false;
      }
    },
    [saveSettings]
  );

  return {
    // 설정 상태
    ...settings,

    // 설정 변경 함수
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setWorkSessionsBeforeLongBreak,
    setDailyGoal,
    setSoundEnabled,
    setVolume,
    setShowNotification,
    setGlobalModeEnabled,
    setShowTestControls,

    // 설정 관리 함수
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
}
