/**
 * 마크다운 변환 유틸리티
 *
 * 마크다운 텍스트를 HTML로 변환하는 기능을 제공합니다.
 * markdown-it 라이브러리를 사용하여 안정적인 파싱 및 변환을 수행합니다.
 */

import MarkdownIt from "markdown-it";

// 마크다운 파서 인스턴스 생성 및 설정
const md = new MarkdownIt({
  html: true, // HTML 태그 허용
  linkify: true, // URL을 자동으로 링크로 변환
  typographer: true, // 인용 부호, 대시 등 변환
  breaks: true, // 줄바꿈을 <br>로 변환
});

/**
 * 마크다운 텍스트를 HTML로 변환
 * @param markdownText 변환할 마크다운 텍스트
 * @returns 변환된 HTML 문자열
 */
export function convertMarkdownToHtml(markdownText: string): string {
  if (!markdownText) return "";

  try {
    // markdown-it을 사용하여 변환
    return md.render(markdownText);
  } catch (error) {
    console.error("마크다운 변환 오류:", error);
    // 오류 발생 시 대체 변환 로직 사용 (fallback)
    return fallbackMarkdownConverter(markdownText);
  }
}

/**
 * 대체 마크다운 변환 함수 (markdown-it이 실패할 경우 사용)
 * 기본적인 마크다운 구문만 지원하는 간단한 구현
 * @param md 변환할 마크다운 텍스트
 * @returns 변환된 HTML 문자열
 */
function fallbackMarkdownConverter(md: string): string {
  let html = md;

  // 임시로 코드 블록을 보존
  const codeBlocks: string[] = [];
  html = html.replace(/```([\s\S]*?)```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 인라인 코드 보존
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (match) => {
    inlineCodes.push(match);
    return `__INLINE_CODE_${inlineCodes.length - 1}__`;
  });

  // 헤더 변환
  html = html
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gm, "<h4>$1</h4>")
    .replace(/^##### (.*$)/gm, "<h5>$1</h5>")
    .replace(/^###### (.*$)/gm, "<h6>$1</h6>");

  // 굵게, 기울임, 취소선
  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>");

  // 링크
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // 이미지
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // 순서 없는 목록 아이템
  const ulItems: string[] = [];
  html = html.replace(/^- (.*$)/gm, (match, p1) => {
    ulItems.push(`<li>${p1}</li>`);
    return `__UL_ITEM_${ulItems.length - 1}__`;
  });

  // 순서 있는 목록 아이템
  const olItems: string[] = [];
  html = html.replace(/^\d+\. (.*$)/gm, (match, p1) => {
    olItems.push(`<li>${p1}</li>`);
    return `__OL_ITEM_${olItems.length - 1}__`;
  });

  // 목록 그룹화
  let inOl = false;
  let inUl = false;
  let lines = html.split("\n");

  for (let i = 0; i < lines.length; i++) {
    // 순서 있는 목록 처리
    if (lines[i].startsWith("__OL_ITEM_")) {
      const index = parseInt(lines[i].match(/__OL_ITEM_(\d+)__/)?.[1] || "0");

      if (!inOl) {
        lines[i] = `<ol>${olItems[index]}`;
        inOl = true;
      } else {
        lines[i] = olItems[index];
      }

      // 다음 줄이 목록이 아니면 목록 닫기
      if (i === lines.length - 1 || !lines[i + 1].startsWith("__OL_ITEM_")) {
        lines[i] += "</ol>";
        inOl = false;
      }
    }
    // 순서 없는 목록 처리
    else if (lines[i].startsWith("__UL_ITEM_")) {
      const index = parseInt(lines[i].match(/__UL_ITEM_(\d+)__/)?.[1] || "0");

      if (!inUl) {
        lines[i] = `<ul>${ulItems[index]}`;
        inUl = true;
      } else {
        lines[i] = ulItems[index];
      }

      // 다음 줄이 목록이 아니면 목록 닫기
      if (i === lines.length - 1 || !lines[i + 1].startsWith("__UL_ITEM_")) {
        lines[i] += "</ul>";
        inUl = false;
      }
    }
  }

  html = lines.join("<br>");

  // 코드 블록 복원
  codeBlocks.forEach((block, i) => {
    const code = block.replace(/```([\s\S]*?)```/g, "$1").trim();
    html = html.replace(
      `__CODE_BLOCK_${i}__`,
      `<pre><code>${code}</code></pre>`
    );
  });

  // 인라인 코드 복원
  inlineCodes.forEach((code, i) => {
    const inlineCode = code.replace(/`([^`]+)`/g, "$1");
    html = html.replace(`__INLINE_CODE_${i}__`, `<code>${inlineCode}</code>`);
  });

  return html;
}

/**
 * 마크다운 구문을 생성하는 유틸리티 함수들
 */
export const markdownSyntax = {
  /**
   * 굵은 텍스트 구문 생성
   * @param text 굵게 표시할 텍스트
   * @returns 마크다운 굵음 구문
   */
  bold: (text: string = "텍스트") => `**${text}**`,

  /**
   * 기울임 텍스트 구문 생성
   * @param text 기울여 표시할 텍스트
   * @returns 마크다운 기울임 구문
   */
  italic: (text: string = "텍스트") => `*${text}*`,

  /**
   * 취소선 텍스트 구문 생성
   * @param text 취소선을 표시할 텍스트
   * @returns 마크다운 취소선 구문
   */
  strikethrough: (text: string = "텍스트") => `~~${text}~~`,

  /**
   * 링크 구문 생성
   * @param text 링크 텍스트
   * @param url 링크 URL
   * @returns 마크다운 링크 구문
   */
  link: (text: string = "링크 텍스트", url: string = "https://example.com") =>
    `[${text}](${url})`,

  /**
   * 이미지 구문 생성
   * @param altText 대체 텍스트
   * @param url 이미지 URL
   * @returns 마크다운 이미지 구문
   */
  image: (
    altText: string = "이미지 설명",
    url: string = "https://example.com/image.jpg"
  ) => `![${altText}](${url})`,

  /**
   * 순서 없는 목록 구문 생성
   * @param items 목록 항목 배열
   * @returns 마크다운 순서 없는 목록 구문
   */
  unorderedList: (items: string[] = ["항목 1", "항목 2", "항목 3"]) =>
    items.map((item) => `- ${item}`).join("\n"),

  /**
   * 순서 있는 목록 구문 생성
   * @param items 목록 항목 배열
   * @returns 마크다운 순서 있는 목록 구문
   */
  orderedList: (items: string[] = ["항목 1", "항목 2", "항목 3"]) =>
    items.map((item, index) => `${index + 1}. ${item}`).join("\n"),

  /**
   * 코드 블록 구문 생성
   * @param code 코드 내용
   * @param language 코드 언어 (선택 사항)
   * @returns 마크다운 코드 블록 구문
   */
  codeBlock: (code: string = "코드를 입력하세요", language: string = "") =>
    `\`\`\`${language}\n${code}\n\`\`\``,

  /**
   * 인라인 코드 구문 생성
   * @param code 코드 내용
   * @returns 마크다운 인라인 코드 구문
   */
  inlineCode: (code: string = "코드") => `\`${code}\``,

  /**
   * 헤더 구문 생성
   * @param text 헤더 텍스트
   * @param level 헤더 레벨 (1-6)
   * @returns 마크다운 헤더 구문
   */
  heading: (text: string = "제목", level: number = 1) => {
    // 유효한 헤더 레벨 확인 (1-6)
    const validLevel = Math.max(1, Math.min(6, level));
    return `${"#".repeat(validLevel)} ${text}`;
  },
};
