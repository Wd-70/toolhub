"use client";

import type React from "react";
import { useMarkdownEditor } from "@/hooks/use-markdown-editor";
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
  Undo2,
  Redo2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * 마크다운 예제 데이터
 */
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

/**
 * 마크다운 에디터 UI 컴포넌트
 * 마크다운 편집 및 미리보기 기능을 제공합니다.
 */
export default function MarkdownEditor() {
  // 마크다운 에디터 훅 사용
  const {
    markdown,
    html,
    copied,
    textareaRef,
    handleMarkdownChange,
    copyMarkdown,
    downloadMarkdown,
    insertMarkdown,
    undo,
    redo,
    isReady,
    canUndo,
    canRedo,
  } = useMarkdownEditor();

  // 클라이언트 사이드 렌더링 체크
  if (!isReady) {
    return <div>마크다운 에디터를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
          간편한 마크다운 문서 작성 (TEST)
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
                  <MarkdownToolbar
                    onInsert={insertMarkdown}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                  />
                  <Textarea
                    ref={textareaRef}
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
                  <MarkdownGuide />
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
          <MarkdownInfoCard />
        </div>
      </div>
    </div>
  );
}

/**
 * 마크다운 툴바 컴포넌트
 */
function MarkdownToolbar({
  onInsert,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  onInsert: (syntax: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("bold")}
        className="h-8 px-2"
        title="굵게 (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("italic")}
        className="h-8 px-2"
        title="기울임 (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("list")}
        className="h-8 px-2"
        title="순서 없는 목록"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("ordered-list")}
        className="h-8 px-2"
        title="순서 있는 목록"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("link")}
        className="h-8 px-2"
        title="링크 (Ctrl+K)"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("image")}
        className="h-8 px-2"
        title="이미지"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert("code")}
        className="h-8 px-2"
        title="코드 블록"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        className="h-8 px-2 ml-2"
        title="실행 취소 (Ctrl+Z)"
        disabled={!canUndo}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        className="h-8 px-2"
        title="다시 실행 (Ctrl+Y 또는 Ctrl+Shift+Z)"
        disabled={!canRedo}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * 마크다운 가이드 컴포넌트
 */
function MarkdownGuide() {
  return (
    <>
      <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
        <Info className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium mb-1">마크다운이란?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            마크다운은 일반 텍스트로 서식이 있는 문서를 작성하는 방법입니다.
            HTML로 변환이 쉽고, 읽기 쉬운 문법을 가지고 있어 문서 작성에 널리
            사용됩니다.
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
                  <h4 className="text-sm font-medium">{example.name}</h4>
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
                문서의 구조를 명확히 하기 위해 제목 레벨을 순차적으로
                사용하세요.
              </li>
              <li>
                복잡한 표는 HTML을 직접 사용하는 것이 더 효과적일 수 있습니다.
              </li>
              <li>
                에디터 상단의 버튼을 사용하면 일반적인 마크다운 구문을 쉽게
                삽입할 수 있습니다.
              </li>
              <li>
                작성한 문서는 로컬 스토리지에 자동 저장되며, 다운로드 버튼을
                통해 파일로 저장할 수 있습니다.
              </li>
              <li>
                실행 취소(Ctrl+Z)와 재실행(Ctrl+Y)을 사용하여 편집 내역을 관리할
                수 있습니다.
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
                <li>GitHub, GitLab 등의 README 파일과 이슈, 코멘트 작성</li>
                <li>블로그 플랫폼 (Jekyll, Hugo, Gatsby 등)</li>
                <li>노트 앱 (Notion, Obsidian, Typora 등)</li>
                <li>기술 문서 작성 (MkDocs, Docusaurus 등)</li>
                <li>메시징 플랫폼 (Slack, Discord 등)</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

/**
 * 마크다운 정보 카드 컴포넌트
 */
function MarkdownInfoCard() {
  return (
    <>
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
          마크다운은 2004년 존 그루버(John Gruber)와 애론 스워츠(Aaron Swartz)가
          개발했습니다. 원래 목적은 "읽기 쉬운 일반 텍스트 형식으로 작성하고
          구조적으로 유효한 XHTML(또는 HTML)로 선택적 변환이 가능한
          것"이었습니다.
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
    </>
  );
}
