"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionData } from "../types";

interface DailyStats {
  date: string;
  completedSessions: number;
}

export function useStats() {
  const [todayCompletedSessions, setTodayCompletedSessions] =
    useState<number>(0);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(8);

  // 오늘 날짜
  const getTodayDate = useCallback(() => {
    return new Date().toLocaleDateString();
  }, []);

  // 오늘 완료한 세션 수 로드
  useEffect(() => {
    const loadTodayCompletedSessions = () => {
      if (typeof window !== "undefined") {
        const today = getTodayDate();
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
              setTodayCompletedSessions(0);
            }
          } catch (e) {
            console.error("저장된 데이터를 불러오는 중 오류 발생:", e);
            setTodayCompletedSessions(0);
          }
        } else {
          localStorage.setItem(
            "pomodoroStats",
            JSON.stringify({
              date: today,
              completedSessions: 0,
            })
          );
          setTodayCompletedSessions(0);
        }
      }
    };

    loadTodayCompletedSessions();
  }, [getTodayDate]);

  // 세션 완료 시 호출되는 함수
  const incrementCompletedSessions = useCallback(() => {
    const newCount = todayCompletedSessions + 1;
    setTodayCompletedSessions(newCount);

    // 로컬 스토리지에 저장
    if (typeof window !== "undefined") {
      const today = getTodayDate();
      localStorage.setItem(
        "pomodoroStats",
        JSON.stringify({
          date: today,
          completedSessions: newCount,
        })
      );
    }
  }, [todayCompletedSessions, getTodayDate]);

  // 세션 데이터 추가
  const addSession = useCallback(
    (session: SessionData) => {
      setSessions((prev) => [...prev, session]);

      // 작업 세션인 경우 완료 카운트 증가
      if (session.type === "work") {
        incrementCompletedSessions();
      }

      // 세션 히스토리 저장
      if (typeof window !== "undefined") {
        const sessionHistory = localStorage.getItem("pomodoroSessionHistory");
        let history: SessionData[] = [];

        if (sessionHistory) {
          try {
            history = JSON.parse(sessionHistory);
          } catch (e) {
            console.error("세션 히스토리를 불러오는 중 오류 발생:", e);
          }
        }

        history.push(session);

        // 최대 100개 세션만 저장
        if (history.length > 100) {
          history = history.slice(history.length - 100);
        }

        localStorage.setItem("pomodoroSessionHistory", JSON.stringify(history));
      }
    },
    [incrementCompletedSessions]
  );

  // 세션 히스토리 로드
  useEffect(() => {
    const loadSessionHistory = () => {
      if (typeof window !== "undefined") {
        const sessionHistory = localStorage.getItem("pomodoroSessionHistory");

        if (sessionHistory) {
          try {
            const history = JSON.parse(sessionHistory);
            setSessions(history);
          } catch (e) {
            console.error("세션 히스토리를 불러오는 중 오류 발생:", e);
          }
        }
      }
    };

    loadSessionHistory();
  }, []);

  // 일일 목표 달성률 계산
  const getDailyGoalProgress = useCallback(() => {
    return (todayCompletedSessions / dailyGoal) * 100;
  }, [todayCompletedSessions, dailyGoal]);

  // 통계 데이터 정리
  const getStatsData = useCallback(() => {
    const workSessions = sessions.filter((session) => session.type === "work");
    const breakSessions = sessions.filter(
      (session) => session.type === "break" || session.type === "longBreak"
    );

    return {
      totalWorkSessions: workSessions.length,
      totalWorkTime:
        workSessions.reduce((acc, session) => acc + session.duration, 0) / 60, // 분 단위
      totalBreakTime:
        breakSessions.reduce((acc, session) => acc + session.duration, 0) / 60, // 분 단위
      dailyProgress: getDailyGoalProgress(),
    };
  }, [sessions, getDailyGoalProgress]);

  // 세션 기록 초기화
  const clearSessionHistory = useCallback(() => {
    setSessions([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("pomodoroSessionHistory");
    }
  }, []);

  return {
    // 상태
    todayCompletedSessions,
    sessions,
    dailyGoal,

    // 액션
    setTodayCompletedSessions,
    setSessions,
    setDailyGoal,
    incrementCompletedSessions,
    addSession,
    getDailyGoalProgress,
    getStatsData,
    clearSessionHistory,
  };
}
