"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Copy, Check, HelpCircle, Info, Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToolState } from "@/hooks/use-tool-state";

// 코드 포매터 상태 타입 정의
interface CodeFormatterState {
  code: string;
  formattedCode: string;
  language: string;
  indentation: string;
}

// 기본 상태 값
const defaultCodeFormatterState: CodeFormatterState = {
  code: "",
  formattedCode: "",
  language: "javascript",
  indentation: "2",
};

export default function CodeFormatter() {
  // useToolState 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();

  // 도구 상태 가져오기
  const toolState = getToolState<CodeFormatterState>("code-formatter");
  const state = toolState?.data || defaultCodeFormatterState;

  // 로컬 상태 (컨텍스트에서 관리할 상태)
  const [code, setCode] = useState<string>(state.code);
  const [formattedCode, setFormattedCode] = useState<string>(
    state.formattedCode
  );
  const [language, setLanguage] = useState<string>(state.language);
  const [indentation, setIndentation] = useState<string>(state.indentation);
  const [copied, setCopied] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // 상태 업데이트 함수 - 상태 변경을 Context에 저장
  const updateCodeFormatterState = () => {
    // 현재 상태를 Context에 저장
    updateToolState<CodeFormatterState>("code-formatter", {
      code,
      formattedCode,
      language,
      indentation,
    });
  };

  useEffect(() => {
    // 클라이언트 사이드 체크
    setIsClient(true);

    // 도구 열림 이벤트 기록
    addHistoryEntry("code-formatter", "open");

    // 컴포넌트 언마운트 시 도구 닫힘 이벤트 기록
    return () => {
      addHistoryEntry("code-formatter", "close");
    };
  }, []);

  // 상태가 변경될 때마다 Context 업데이트
  useEffect(() => {
    if (isClient) {
      updateCodeFormatterState();
    }
  }, [code, formattedCode, language, indentation, isClient]);

  const formatCode = () => {
    // 실제 구현에서는 prettier 등의 라이브러리를 사용할 수 있습니다
    // 여기서는 간단한 목업으로 들여쓰기만 조정합니다
    try {
      let result = code;

      // 간단한 포맷팅 시뮬레이션
      if (language === "javascript" || language === "typescript") {
        // 중괄호 뒤에 줄바꿈 추가
        result = result.replace(/\{(?!\n)/g, "{\n");
        // 닫는 중괄호 앞에 줄바꿈 추가
        result = result.replace(/(?<!\n)\}/g, "\n}");
        // 세미콜론 뒤에 줄바꿈 추가
        result = result.replace(/;(?!\n)/g, ";\n");
      }

      // 들여쓰기 적용
      const lines = result.split("\n");
      let depth = 0;
      const indentSize = Number.parseInt(indentation);

      result = lines
        .map((line) => {
          const trimmedLine = line.trim();

          // 닫는 괄호가 있으면 들여쓰기 감소
          if (
            trimmedLine.startsWith("}") ||
            trimmedLine.startsWith(")") ||
            trimmedLine.startsWith("]")
          ) {
            depth = Math.max(0, depth - 1);
          }

          const indent = " ".repeat(indentSize * depth);
          const formattedLine = indent + trimmedLine;

          // 여는 괄호가 있으면 들여쓰기 증가
          if (
            trimmedLine.endsWith("{") ||
            trimmedLine.endsWith("(") ||
            trimmedLine.endsWith("[")
          ) {
            depth += 1;
          }

          return formattedLine;
        })
        .join("\n");

      setFormattedCode(result);

      // 업데이트 이벤트 기록
      addHistoryEntry("code-formatter", "update");

      // 상태 업데이트
      setTimeout(() => updateCodeFormatterState(), 0);
    } catch (error) {
      setFormattedCode("Error formatting code");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-violet-800 dark:text-violet-300">
          코드를 깔끔하게 정리하세요
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          다양한 프로그래밍 언어의 코드를 자동으로 포맷팅하여 가독성을 높이고
          일관된 스타일을 유지하세요.
        </p>
      </div>

      <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 border-violet-200 dark:border-violet-800">
        <CardHeader className="bg-violet-50 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-violet-500" />
            <CardTitle>Code Formatter</CardTitle>
          </div>
          <CardDescription>
            코드를 입력하고 포맷팅 옵션을 선택한 후 포맷 버튼을 클릭하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Input Code</h3>
                  <Textarea
                    placeholder="여기에 코드를 입력하세요..."
                    className="font-mono h-[300px] resize-none"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Formatted Code</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      disabled={!formattedCode}
                      className="h-8 gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    className="font-mono h-[300px] resize-none bg-gray-50 dark:bg-gray-800"
                    value={formattedCode}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Indentation</label>
                  <Select value={indentation} onValueChange={setIndentation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select indentation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="guide" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
                  <Info className="h-5 w-5 text-violet-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">코드 포맷터 사용법</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      코드 포맷터는 들여쓰기, 줄바꿈, 공백 등을 자동으로
                      조정하여 코드를 일관된 스타일로 정리해주는 도구입니다.
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm font-medium">
                      기본 사용법
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>
                          왼쪽 입력창에 포맷팅할 코드를 붙여넣거나 직접
                          입력하세요.
                        </li>
                        <li>
                          Settings 탭에서 언어와 들여쓰기 옵션을 선택하세요.
                        </li>
                        <li>
                          Format Code 버튼을 클릭하면 오른쪽에 포맷팅된 코드가
                          표시됩니다.
                        </li>
                        <li>
                          Copy 버튼을 클릭하여 포맷팅된 코드를 클립보드에 복사할
                          수 있습니다.
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm font-medium">
                      지원하는 언어
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        현재 다음 언어들의 포맷팅을 지원합니다:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>JavaScript</li>
                        <li>TypeScript</li>
                        <li>HTML</li>
                        <li>CSS</li>
                        <li>JSON</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm font-medium">
                      팁과 트릭
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p>
                            대용량 코드는 여러 번 나누어 포맷팅하면 더
                            효율적입니다.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p>
                            JavaScript와 TypeScript는 세미콜론 위치와 중괄호
                            스타일에 특히 주의하세요.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p>
                            팀 프로젝트에서는 일관된 포맷팅 규칙을 사용하는 것이
                            좋습니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6">
          <Button
            onClick={formatCode}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            Format Code
          </Button>
        </CardFooter>
      </Card>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-violet-100 dark:border-violet-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            </div>
            <h3 className="font-medium">왜 코드 포맷팅이 중요한가요?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            일관된 코드 스타일은 가독성을 높이고 버그를 줄이며 팀 협업을
            원활하게 합니다. 자동 포맷팅은 이러한 일관성을 쉽게 유지할 수 있게
            해줍니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-violet-100 dark:border-violet-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <Code className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            </div>
            <h3 className="font-medium">코드 스타일 가이드</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            많은 기업과 오픈소스 프로젝트는 자체 코드 스타일 가이드를 가지고
            있습니다. 이 포맷터는 기본적인 스타일 규칙을 적용하여 코드를
            정리합니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-violet-100 dark:border-violet-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            </div>
            <h3 className="font-medium">알고 계셨나요?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            대부분의 현대 코드 에디터는 저장 시 자동 포맷팅 기능을 제공합니다.
            이 온라인 도구는 에디터 설정 없이도 빠르게 코드를 정리할 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
