"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToolState } from "@/hooks/use-tool-state";
import {
  convertMarkdownToHtml,
  markdownSyntax,
} from "@/lib/markdown/markdown-converter";

/**
 * 마크다운 에디터 상태 타입 정의
 */
export interface MarkdownEditorState {
  markdown: string;
  html: string;
  history: {
    past: string[];
    future: string[];
  };
}

/**
 * 초기 마크다운 에디터 상태
 */
const defaultMarkdownState: MarkdownEditorState = {
  markdown: `# 마크다운 에디터에 오신 것을 환영합니다!

## 마크다운이란?

마크다운은 텍스트 기반의 마크업 언어로, 쉽게 읽고 쓸 수 있으며 HTML로 변환이 가능합니다.

### 기본 문법

- **굵게**: 텍스트를 **별표 두 개**로 감싸세요.
- *기울임*: 텍스트를 *별표 하나*로 감싸세요.
- [링크](https://example.com): \`[링크 텍스트](URL)\` 형식으로 작성하세요.
- 목록:
  1. 순서가 있는 목록
  2. 두 번째 항목
- 코드: \`인라인 코드\`

\`\`\`
// 코드 블록
function hello() {
  console.log("Hello, world!");
}
\`\`\`

이 에디터에서 마크다운을 작성하고 실시간으로 미리보기를 확인하세요!`,
  html: "",
  history: {
    past: [],
    future: [],
  },
};

/**
 * 마크다운 에디터 커스텀 훅
 * 마크다운 에디터의 상태와 기능을 관리합니다.
 */
export function useMarkdownEditor() {
  // 도구 상태 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 도구 상태 가져오기
  const toolState = getToolState<MarkdownEditorState>("markdown");
  const state = toolState?.data || defaultMarkdownState;

  // 로컬 상태
  const [markdown, setMarkdown] = useState<string>(state.markdown);
  const [html, setHtml] = useState<string>(state.html);
  const [copied, setCopied] = useState<boolean>(false);
  const [localStorageAvailable, setLocalStorageAvailable] =
    useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [history, setHistory] = useState<{
    past: string[];
    future: string[];
  }>(state.history);

  /**
   * 상태 업데이트 함수 - 상태 변경을 Context에 저장
   */
  const updateMarkdownState = useCallback(() => {
    updateToolState<MarkdownEditorState>("markdown", {
      markdown,
      html,
      history,
    });
  }, [updateToolState, markdown, html, history]);

  /**
   * 컴포넌트 초기화 및 이벤트 리스너 설정
   */
  useEffect(() => {
    // 클라이언트 사이드 체크
    setIsClient(true);

    // 로컬 스토리지 사용 가능 여부 확인
    const checkLocalStorage = () => {
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        setLocalStorageAvailable(true);

        // 컨텍스트 상태가 없는 경우에만 로컬 스토리지에서 불러오기
        if (!toolState) {
          const savedMarkdown = localStorage.getItem("markdown");
          if (savedMarkdown) {
            setMarkdown(savedMarkdown);
            // 초기 상태 기록
            setTimeout(() => updateMarkdownState(), 0);
          }
        }
      } catch (e) {
        setLocalStorageAvailable(false);
      }
    };

    checkLocalStorage();

    // 키보드 이벤트 리스너 등록
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 또는 Cmd+Z (Mac) - 실행 취소
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y 또는 Cmd+Shift+Z (Mac) - 재실행
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // 도구 열림 이벤트 기록
    addHistoryEntry("markdown", "open");

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 도구 닫힘 이벤트 기록
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      addHistoryEntry("markdown", "close");
    };
  }, [addHistoryEntry, toolState, updateMarkdownState]);

  /**
   * 마크다운 변경 시 HTML 변환 및 저장
   */
  useEffect(() => {
    // 마크다운을 HTML로 변환
    const newHtml = convertMarkdownToHtml(markdown);
    setHtml(newHtml);

    // 로컬 스토리지에 저장
    if (localStorageAvailable) {
      localStorage.setItem("markdown", markdown);
    }

    // 마크다운이나 HTML이 변경될 때 Context에 상태 저장
    updateMarkdownState();
  }, [markdown, localStorageAvailable, updateMarkdownState]);

  /**
   * 실행 취소 함수
   */
  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory({
      past: newPast,
      future: [markdown, ...history.future],
    });

    setMarkdown(previous);
  }, [history, markdown]);

  /**
   * 재실행 함수
   */
  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, markdown],
      future: newFuture,
    });

    setMarkdown(next);
  }, [history, markdown]);

  /**
   * 마크다운 텍스트 변경 핸들러
   */
  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // 현재 상태를 history에 추가
      if (markdown !== newValue) {
        setHistory({
          past: [...history.past, markdown],
          future: [], // 새로운 변경이 있으면 future는 초기화
        });

        setMarkdown(newValue);
        // 업데이트 이벤트 기록
        addHistoryEntry("markdown", "update");
      }
    },
    [markdown, history, addHistoryEntry]
  );

  /**
   * 마크다운 복사 함수
   */
  const copyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  /**
   * 마크다운 다운로드 함수
   */
  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  /**
   * 마크다운 구문 삽입 함수
   */
  const insertMarkdown = useCallback(
    (syntax: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      let newText = "";
      let newCursorPos = 0;

      // 현재 상태를 history에 추가
      setHistory({
        past: [...history.past, markdown],
        future: [], // 새로운 변경이 있으면 future는 초기화
      });

      switch (syntax) {
        case "bold":
          newText =
            text.substring(0, start) +
            markdownSyntax.bold() +
            text.substring(end);
          newCursorPos = start + 2;
          break;
        case "italic":
          newText =
            text.substring(0, start) +
            markdownSyntax.italic() +
            text.substring(end);
          newCursorPos = start + 1;
          break;
        case "list":
          newText =
            text.substring(0, start) +
            "\n" +
            markdownSyntax.unorderedList() +
            "\n" +
            text.substring(end);
          newCursorPos = start + 3;
          break;
        case "ordered-list":
          newText =
            text.substring(0, start) +
            "\n" +
            markdownSyntax.orderedList() +
            "\n" +
            text.substring(end);
          newCursorPos = start + 3;
          break;
        case "link":
          newText =
            text.substring(0, start) +
            markdownSyntax.link() +
            text.substring(end);
          newCursorPos = start + 1;
          break;
        case "image":
          newText =
            text.substring(0, start) +
            markdownSyntax.image() +
            text.substring(end);
          newCursorPos = start + 2;
          break;
        case "code":
          newText =
            text.substring(0, start) +
            markdownSyntax.codeBlock() +
            text.substring(end);
          newCursorPos = start + 4;
          break;
        default:
          return;
      }

      setMarkdown(newText);

      // 업데이트 이벤트 기록
      addHistoryEntry("markdown", "update");

      // 상태 업데이트 적용
      setTimeout(() => updateMarkdownState(), 0);

      // 커서 위치 설정 (비동기로 처리)
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos + 6);
      }, 0);
    },
    [markdown, history, addHistoryEntry, updateMarkdownState]
  );

  return {
    markdown,
    html,
    copied,
    textareaRef,
    history,
    handleMarkdownChange,
    copyMarkdown,
    downloadMarkdown,
    insertMarkdown,
    undo,
    redo,
    isReady: isClient,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
