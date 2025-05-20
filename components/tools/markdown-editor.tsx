"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Code,
  Copy,
  Check,
  Download,
  Info,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToolState } from "@/hooks/use-tool-state";

// 마크다운 에디터 상태 타입 정의
interface MarkdownEditorState {
  markdown: string;
  html: string;
}

// 기본 상태 값
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
};

export default function MarkdownEditor() {
  // useToolState 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();

  // 도구 상태 가져오기
  const toolState = getToolState<MarkdownEditorState>("markdown");
  const state = toolState?.data || defaultMarkdownState;

  // 로컬 상태 (컨텍스트에서 관리할 상태)
  const [markdown, setMarkdown] = useState<string>(state.markdown);
  const [html, setHtml] = useState<string>(state.html);
  const [copied, setCopied] = useState<boolean>(false);
  const [localStorageAvailable, setLocalStorageAvailable] =
    useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // 상태 업데이트 함수 - 상태 변경을 Context에 저장
  const updateMarkdownState = () => {
    // 현재 상태를 Context에 저장
    updateToolState<MarkdownEditorState>("markdown", {
      markdown,
      html,
    });
  };

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

    // 도구 열림 이벤트 기록
    addHistoryEntry("markdown", "open");

    // 컴포넌트 언마운트 시 도구 닫힘 이벤트 기록
    return () => {
      addHistoryEntry("markdown", "close");
    };
  }, []);

  useEffect(() => {
    // 마크다운을 HTML로 변환 (간단한 구현)
    const convertToHtml = (md: string) => {
      let html = md
        // 헤더
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        // 굵게, 기울임
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // 링크
        .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank">$1</a>')
        // 코드 블록
        .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
        // 인라인 코드
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        // 순서 없는 목록
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        // 순서 있는 목록
        .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
        // 줄바꿈
        .replace(/\n/g, "<br>");

      // 목록 아이템을 ul, ol로 감싸기 (간단한 구현)
      html = html.replace(/<li>.*?<\/li>/g, (match) => {
        if (match.startsWith("<li>1.")) {
          return `<ol>${match}</ol>`;
        }
        return `<ul>${match}</ul>`;
      });

      return html;
    };

    const newHtml = convertToHtml(markdown);
    setHtml(newHtml);

    // 로컬 스토리지에 저장
    if (localStorageAvailable) {
      localStorage.setItem("markdown", markdown);
    }

    // 마크다운이나 HTML이 변경될 때 Context에 상태 저장
    updateMarkdownState();
  }, [markdown, localStorageAvailable]);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    // 업데이트 이벤트 기록
    addHistoryEntry("markdown", "update");
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let newText = "";
    let newCursorPos = 0;

    switch (syntax) {
      case "bold":
        newText = text.substring(0, start) + "**텍스트**" + text.substring(end);
        newCursorPos = start + 2;
        break;
      case "italic":
        newText = text.substring(0, start) + "*텍스트*" + text.substring(end);
        newCursorPos = start + 1;
        break;
      case "list":
        newText =
          text.substring(0, start) +
          "\n- 항목 1\n- 항목 2\n- 항목 3\n" +
          text.substring(end);
        newCursorPos = start + 3;
        break;
      case "ordered-list":
        newText =
          text.substring(0, start) +
          "\n1. 항목 1\n2. 항목 2\n3. 항목 3\n" +
          text.substring(end);
        newCursorPos = start + 3;
        break;
      case "link":
        newText =
          text.substring(0, start) +
          "[링크 텍스트](https://example.com)" +
          text.substring(end);
        newCursorPos = start + 1;
        break;
      case "image":
        newText =
          text.substring(0, start) +
          "![이미지 설명](https://example.com/image.jpg)" +
          text.substring(end);
        newCursorPos = start + 2;
        break;
      case "code":
        newText =
          text.substring(0, start) +
          "```\n코드를 입력하세요\n```" +
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
  };

  // 마크다운 문법 예제
  const markdownExamples = [
    {
      name: "제목",
      syntax: "# 제목 1\n## 제목 2\n### 제목 3",
      description:
        "# 기호와 공백으로 제목을 만듭니다. #의 개수에 따라 크기가 달라집니다.",
    },
    {
      name: "강조",
      syntax: "**굵게** 또는 *기울임* 또는 ~~취소선~~",
      description: "별표와 물결 기호로 텍스트를 강조합니다.",
    },
    {
      name: "목록",
      syntax: "- 항목 1\n- 항목 2\n  - 중첩 항목",
      description:
        "하이픈(-)으로 순서 없는 목록을, 숫자와 점으로 순서 있는 목록을 만듭니다.",
    },
    {
      name: "링크",
      syntax: "[링크 텍스트](https://example.com)",
      description: "대괄호와 소괄호를 사용하여 링크를 만듭니다.",
    },
    {
      name: "이미지",
      syntax: "![대체 텍스트](이미지URL)",
      description: "링크 앞에 느낌표를 추가하여 이미지를 삽입합니다.",
    },
    {
      name: "코드",
      syntax: "`인라인 코드` 또는 ```\n코드 블록\n```",
      description: "백틱(`)으로 코드를 감싸 코드 형식으로 표시합니다.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
          간편한 마크다운 문서 작성
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          마크다운 문법으로 문서를 작성하고 실시간으로 미리보기를 확인하세요.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="md:w-2/3">
          <Card className="w-full bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-500" />
                <CardTitle>Markdown Editor</CardTitle>
              </div>
              <CardDescription>
                마크다운 문서를 작성하고 실시간으로 미리보기를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="guide">Guide</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("bold")}
                      className="h-8 px-2"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("italic")}
                      className="h-8 px-2"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("list")}
                      className="h-8 px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("ordered-list")}
                      className="h-8 px-2"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("link")}
                      className="h-8 px-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("image")}
                      className="h-8 px-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("code")}
                      className="h-8 px-2"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={markdown}
                    onChange={handleMarkdownChange}
                    className="font-mono h-[400px] resize-none"
                    placeholder="마크다운을 입력하세요..."
                  />
                </TabsContent>
                <TabsContent
                  value="preview"
                  className="border rounded-md p-4 min-h-[400px] prose dark:prose-invert max-w-none"
                >
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </TabsContent>
                <TabsContent value="guide" className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <Info className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">마크다운이란?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        마크다운은 일반 텍스트로 서식이 있는 문서를 작성하는
                        방법입니다. HTML로 변환이 쉽고, 읽기 쉬운 문법을 가지고
                        있어 문서 작성에 널리 사용됩니다.
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-sm font-medium">
                        마크다운 기본 문법
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {markdownExamples.map((example, index) => (
                            <div key={index} className="space-y-1">
                              <h4 className="text-sm font-medium">
                                {example.name}
                              </h4>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto">
                                {example.syntax}
                              </pre>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {example.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-sm font-medium">
                        마크다운 사용 팁
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li>
                            문서의 구조를 명확히 하기 위해 제목 레벨을
                            순차적으로 사용하세요.
                          </li>
                          <li>
                            복잡한 표는 HTML을 직접 사용하는 것이 더 효과적일 수
                            있습니다.
                          </li>
                          <li>
                            에디터 상단의 버튼을 사용하면 일반적인 마크다운
                            구문을 쉽게 삽입할 수 있습니다.
                          </li>
                          <li>
                            작성한 문서는 로컬 스토리지에 자동 저장되며,
                            다운로드 버튼을 통해 파일로 저장할 수 있습니다.
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-sm font-medium">
                        마크다운 활용 사례
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>마크다운은 다양한 플랫폼과 도구에서 사용됩니다:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              GitHub, GitLab 등의 README 파일과 이슈, 코멘트
                              작성
                            </li>
                            <li>블로그 플랫폼 (Jekyll, Hugo, Gatsby 등)</li>
                            <li>노트 앱 (Notion, Obsidian, Typora 등)</li>
                            <li>기술 문서 작성 (MkDocs, Docusaurus 등)</li>
                            <li>메시징 플랫폼 (Slack, Discord 등)</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6 flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyMarkdown}
                  className="gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadMarkdown}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {markdown.length} characters
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-emerald-100 dark:border-emerald-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="font-medium">마크다운의 장점</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>간결하고 읽기 쉬운 문법</li>
              <li>일반 텍스트로 작성되어 어떤 텍스트 에디터에서도 편집 가능</li>
              <li>HTML로 쉽게 변환되어 웹에서 표시 가능</li>
              <li>버전 관리 시스템과 함께 사용하기 좋음</li>
              <li>다양한 플랫폼과 도구에서 지원</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-emerald-100 dark:border-emerald-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="font-medium">알고 계셨나요?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              마크다운은 2004년 존 그루버(John Gruber)와 애론 스워츠(Aaron
              Swartz)가 개발했습니다. 원래 목적은 "읽기 쉬운 일반 텍스트
              형식으로 작성하고 구조적으로 유효한 XHTML(또는 HTML)로 선택적
              변환이 가능한 것"이었습니다.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-emerald-100 dark:border-emerald-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="font-medium">마크다운 확장</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              기본 마크다운 외에도 다양한 확장 문법이 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>GitHub Flavored Markdown (GFM)</li>
              <li>CommonMark</li>
              <li>MultiMarkdown</li>
              <li>Markdown Extra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
