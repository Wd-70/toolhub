# ToolHub 개발 가이드라인

## 프로젝트 개요

- ToolHub는 다양한 웹 기반 도구를 단일 플랫폼에서 제공하는 서비스입니다.
- Next.js 프레임워크 기반, React 19 사용, Tailwind CSS로 스타일링, Radix UI 컴포넌트 라이브러리 활용
- 현재 7개의 웹 도구 구현: Code Formatter, Color Picker, Calculator, Pomodoro Timer, Markdown Editor, Unit Converter, Random Picker

## 프로젝트 구조

### 디렉토리 구조

- `/app`: Next.js 라우팅 디렉토리
  - `/page.tsx`: 메인 페이지
  - `/tools/[toolId]/page.tsx`: 동적 라우팅으로 각 도구별 페이지
- `/components`: 재사용 가능한 컴포넌트
  - `/ui`: 공통 UI 컴포넌트
  - `/tools`: 각 도구별 컴포넌트
- `/styles`: 스타일 관련 파일
- `/hooks`: 커스텀 React 훅
- `/lib`: 유틸리티 함수와 API 관련 코드

### 파일 명명 규칙

- 컴포넌트 파일: `kebab-case.tsx` 형식 사용
- 페이지 파일: Next.js 규칙에 따라 `page.tsx` 형식 사용
- 훅 파일: `use-kebab-case.ts` 형식 사용
- 유틸리티 파일: `kebab-case.ts` 형식 사용

## 코드 스타일

### 컴포넌트 작성 규칙

- 함수형 컴포넌트 사용하고 화살표 함수로 작성
- 컴포넌트 이름은 PascalCase 사용
- 로직과 UI 분리: 복잡한 로직은 커스텀 훅으로 분리
- 상태 관리는 React의 내장 상태 관리(useState, useReducer) 사용

### 스타일링 규칙

- Tailwind CSS 클래스 사용을 우선
- 커스텀 스타일이 필요한 경우 `tailwind.config.ts`에 확장
- `className` 속성에는 `clsx` 또는 `tailwind-merge`를 사용하여 조건부 클래스 적용
- 다크 모드는 `dark:` 접두사를 사용하여 지원

### 접근성 규칙

- 모든 이미지에 `alt` 속성 제공
- 의미 있는 HTML 시맨틱 태그 사용
- 키보드 네비게이션 지원
- ARIA 속성 적절히, 필요할 때 사용

## 도구 개발 가이드

### 새 도구 추가 방법

1. `components/tools/`에 새 도구 컴포넌트 파일 추가 (`tool-name.tsx`)
2. `app/tools/[toolId]/page.tsx`에 새 도구 추가:
   - `tools` 객체에 새 도구 항목 추가
   - 컴포넌트 import
3. `app/page.tsx`의 `tools` 배열에 새 도구 정보 추가

### 도구 컴포넌트 구조

- 각 도구는 독립적인 단일 컴포넌트로 개발
- 필요 시 하위 컴포넌트로 분리하여 복잡성 관리
- 상태 관리 코드를 적절한 커스텀 훅으로 분리
- 도구별 스타일링은 일관된 테마를 유지하면서 도구 특성에 맞게 적용

### 도구 개발 필수 요소

- 반응형 디자인: 모바일, 태블릿, 데스크탑 지원
- 다크 모드 지원: 모든 UI 요소에 라이트/다크 테마 스타일 적용
- 오류 처리: 입력 값 검증 및 적절한 오류 메시지 표시
- 접근성: 키보드 네비게이션, 스크린 리더 지원, 충분한 색상 대비
- 성능 최적화: 불필요한 리렌더링 방지, 무거운 연산 최적화

## 서브도메인 리다이렉트 구현

### 서브도메인 설정

- Next.js `next.config.mjs` 파일에 도메인 설정 추가
- 각 도구별 서브도메인 구성: `[toolId].toolhub.com`
- 개발 환경에서는 로컬 호스트 구성으로 테스트

### 리다이렉트 로직

- 기존 경로(`/tools/[toolId]`)에서 서브도메인으로 리다이렉트
- 미들웨어를 사용하여 리다이렉트 구현
- SEO 고려하여 적절한 상태 코드(301) 사용

## 제한 사항 및 금지 사항

- 직접 DOM 조작 금지: React/Next.js 패러다임 준수
- 글로벌 상태 최소화: 필요한 경우에만 Context API 사용
- 인라인 스타일 지양: Tailwind 클래스 사용
- 서버 컴포넌트와 클라이언트 컴포넌트 분리 원칙 준수
- Third-party 라이브러리 추가 시 사전 검토 필요

## 커밋 및 코드 리뷰 가이드

- 커밋 메시지 형식: `[영역]: 변경 내용` (예: `[ui]: 메인 페이지 카드 디자인 개선`)
- 각 도구별 변경사항은 별도 커밋으로 분리
- 큰 변경사항은 작은 단위로 나누어 커밋
