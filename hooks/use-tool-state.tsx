"use client";

import * as React from "react";

// 도구 ID 타입 정의 (app/tools/[toolId]/page.tsx에 정의된 도구 목록과 일치)
export type ToolId =
  | "code-formatter"
  | "color-picker"
  | "calculator"
  | "pomodoro"
  | "markdown"
  | "converter"
  | "random-picker";

// 도구 상태 타입 정의
export interface ToolState<T = any> {
  id: ToolId;
  data: T;
  lastUpdated: number; // 타임스탬프 (밀리초)
  settings?: Record<string, any>; // 도구별 설정
}

// 도구 사용 기록 타입 정의
export interface ToolHistory {
  id: ToolId;
  timestamp: number; // 타임스탬프 (밀리초)
  duration?: number; // 사용 시간 (밀리초)
  action: "open" | "close" | "update"; // 수행한 작업
}

// 도구 간 공유 데이터 타입 정의
export interface SharedData<T = any> {
  sourceToolId: ToolId; // 데이터를 공유한 도구 ID
  targetToolId?: ToolId; // 특정 도구만을 대상으로 할 경우
  type: string; // 데이터 타입
  data: T; // 공유 데이터
  timestamp: number; // 공유 시간 (타임스탬프)
}

// Context에서 제공할 상태와 함수들을 정의하는 타입
export interface ToolStateContextType {
  // 상태
  toolStates: Record<ToolId, ToolState | undefined>;
  history: ToolHistory[];
  sharedData: SharedData[];

  // 도구 상태 관련 함수
  getToolState: <T>(toolId: ToolId) => ToolState<T> | undefined;
  updateToolState: <T>(
    toolId: ToolId,
    data: T,
    settings?: Record<string, any>
  ) => void;
  resetToolState: (toolId: ToolId) => void;
  resetAllToolStates: () => void;

  // 도구 사용 기록 관련 함수
  addHistoryEntry: (
    toolId: ToolId,
    action: ToolHistory["action"],
    duration?: number
  ) => void;
  clearHistory: () => void;

  // 도구 간 데이터 공유 관련 함수
  shareData: <T>(
    sourceToolId: ToolId,
    type: string,
    data: T,
    targetToolId?: ToolId
  ) => void;
  getSharedData: <T>(
    type: string,
    targetToolId?: ToolId
  ) => SharedData<T> | undefined;
  clearSharedData: (sourceToolId?: ToolId, targetToolId?: ToolId) => void;
}

// localStorage 키 상수 정의
const STORAGE_KEYS = {
  TOOL_STATES: "toolhub-tool-states",
  HISTORY: "toolhub-history",
  SHARED_DATA: "toolhub-shared-data",
};

// 빈 도구 상태 객체 생성 함수
const createEmptyToolStates = (): Record<ToolId, ToolState | undefined> => {
  return {
    "code-formatter": undefined,
    "color-picker": undefined,
    calculator: undefined,
    pomodoro: undefined,
    markdown: undefined,
    converter: undefined,
    "random-picker": undefined,
  };
};

// 기본값으로 사용할 Context 객체 생성
const defaultContextValue: ToolStateContextType = {
  toolStates: createEmptyToolStates(),
  history: [],
  sharedData: [],
  getToolState: () => undefined,
  updateToolState: () => {},
  resetToolState: () => {},
  resetAllToolStates: () => {},
  addHistoryEntry: () => {},
  clearHistory: () => {},
  shareData: () => {},
  getSharedData: () => undefined,
  clearSharedData: () => {},
};

// Context 생성
export const ToolStateContext =
  React.createContext<ToolStateContextType>(defaultContextValue);

// Provider Props 타입 정의
export interface ToolStateProviderProps {
  children: React.ReactNode;
  maxHistoryLength?: number; // 히스토리 최대 길이 (기본값: 100)
}

/**
 * 도구 상태 관리를 위한 Provider 컴포넌트
 */
export function ToolStateProvider({
  children,
  maxHistoryLength = 100,
}: ToolStateProviderProps) {
  // 상태 관리
  const [toolStates, setToolStates] = React.useState<
    Record<ToolId, ToolState | undefined>
  >(createEmptyToolStates());
  const [history, setHistory] = React.useState<ToolHistory[]>([]);
  const [sharedData, setSharedData] = React.useState<SharedData[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  // 브라우저 환경 체크
  React.useEffect(() => {
    setIsClient(true);

    // localStorage에서 초기 상태 로드
    if (typeof window !== "undefined") {
      try {
        // 도구 상태 로드
        const savedToolStates = localStorage.getItem(STORAGE_KEYS.TOOL_STATES);
        if (savedToolStates) {
          setToolStates(JSON.parse(savedToolStates));
        }

        // 히스토리 로드
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }

        // 공유 데이터 로드
        const savedSharedData = localStorage.getItem(STORAGE_KEYS.SHARED_DATA);
        if (savedSharedData) {
          setSharedData(JSON.parse(savedSharedData));
        }
      } catch (error) {
        console.error("Error loading tool states from localStorage:", error);
      }
    }
  }, []);

  // 상태 변경 시 localStorage에 저장
  React.useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.TOOL_STATES,
          JSON.stringify(toolStates)
        );
      } catch (error) {
        console.error("Error saving tool states to localStorage:", error);
      }
    }
  }, [toolStates, isClient]);

  // 히스토리 변경 시 localStorage에 저장
  React.useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      } catch (error) {
        console.error("Error saving history to localStorage:", error);
      }
    }
  }, [history, isClient]);

  // 공유 데이터 변경 시 localStorage에 저장
  React.useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.SHARED_DATA,
          JSON.stringify(sharedData)
        );
      } catch (error) {
        console.error("Error saving shared data to localStorage:", error);
      }
    }
  }, [sharedData, isClient]);

  // 도구 상태 가져오기
  const getToolState = React.useCallback<ToolStateContextType["getToolState"]>(
    (toolId) => {
      return toolStates[toolId];
    },
    [toolStates]
  );

  // 도구 상태 업데이트
  const updateToolState = React.useCallback<
    ToolStateContextType["updateToolState"]
  >(
    (toolId, data, settings) => {
      setToolStates((prev) => {
        const currentSettings = prev[toolId]?.settings || {};
        return {
          ...prev,
          [toolId]: {
            id: toolId,
            data,
            lastUpdated: Date.now(),
            settings: settings
              ? { ...currentSettings, ...settings }
              : currentSettings,
          },
        };
      });

      // 히스토리에 업데이트 기록 추가
      addHistoryEntry(toolId, "update");
    },
    [toolStates]
  );

  // 도구 상태 초기화
  const resetToolState = React.useCallback((toolId: ToolId) => {
    setToolStates((prev) => {
      const newState = { ...prev };
      newState[toolId] = undefined;
      return newState;
    });
  }, []);

  // 모든 도구 상태 초기화
  const resetAllToolStates = React.useCallback(() => {
    setToolStates(createEmptyToolStates());
  }, []);

  // 히스토리 항목 추가
  const addHistoryEntry = React.useCallback<
    ToolStateContextType["addHistoryEntry"]
  >(
    (toolId, action, duration) => {
      setHistory((prev) => {
        const newEntry: ToolHistory = {
          id: toolId,
          timestamp: Date.now(),
          action,
          ...(duration !== undefined ? { duration } : {}),
        };

        // 히스토리 최대 길이 제한
        const updatedHistory = [newEntry, ...prev];
        return updatedHistory.slice(0, maxHistoryLength);
      });
    },
    [maxHistoryLength]
  );

  // 히스토리 초기화
  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, []);

  // 데이터 공유
  const shareData = React.useCallback<ToolStateContextType["shareData"]>(
    (sourceToolId, type, data, targetToolId) => {
      setSharedData((prev) => [
        {
          sourceToolId,
          targetToolId,
          type,
          data,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    },
    []
  );

  // 공유 데이터 가져오기
  const getSharedData = React.useCallback<
    ToolStateContextType["getSharedData"]
  >(
    (type, targetToolId) => {
      const filtered = sharedData.filter(
        (data) =>
          data.type === type &&
          (!targetToolId ||
            !data.targetToolId ||
            data.targetToolId === targetToolId)
      );
      return filtered.length > 0 ? filtered[0] : undefined;
    },
    [sharedData]
  );

  // 공유 데이터 초기화
  const clearSharedData = React.useCallback(
    (sourceToolId?: ToolId, targetToolId?: ToolId) => {
      setSharedData((prev) => {
        if (!sourceToolId && !targetToolId) {
          return [];
        }

        return prev.filter(
          (data) =>
            (sourceToolId && data.sourceToolId !== sourceToolId) ||
            (targetToolId && data.targetToolId !== targetToolId)
        );
      });
    },
    []
  );

  // Context 값
  const value = React.useMemo(
    () => ({
      toolStates,
      history,
      sharedData,
      getToolState,
      updateToolState,
      resetToolState,
      resetAllToolStates,
      addHistoryEntry,
      clearHistory,
      shareData,
      getSharedData,
      clearSharedData,
    }),
    [
      toolStates,
      history,
      sharedData,
      getToolState,
      updateToolState,
      resetToolState,
      resetAllToolStates,
      addHistoryEntry,
      clearHistory,
      shareData,
      getSharedData,
      clearSharedData,
    ]
  );

  return (
    <ToolStateContext.Provider value={value}>
      {children}
    </ToolStateContext.Provider>
  );
}

/**
 * 도구 상태에 접근하기 위한 커스텀 훅
 */
export function useToolState() {
  const context = React.useContext(ToolStateContext);

  if (!context) {
    throw new Error("useToolState must be used within a ToolStateProvider");
  }

  return context;
}
