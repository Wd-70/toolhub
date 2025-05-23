"use client";

import React from "react";
import { Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ENABLE_TEST_MODE_UI } from "./config";

interface PomodoroInfoProps {
  className?: string;
}

export function PomodoroInfo({ className }: PomodoroInfoProps) {
  // 포모도로 기법 단계 (변경 없음)
  const pomodoroSteps = [
    {
      step: 1,
      title: "작업 시간 (25분)",
      description:
        "집중해서 한 가지 작업에만 집중하세요. 방해 요소를 모두 제거하고 타이머가 끝날 때까지 작업에 몰입합니다.",
    },
    {
      step: 2,
      title: "짧은 휴식 (5분)",
      description:
        "작업 세션이 끝나면 짧은 휴식을 취하세요. 스트레칭, 물 마시기, 잠시 걷기 등 가벼운 활동을 하세요.",
    },
    {
      step: 3,
      title: "반복",
      description: "4번의 작업 세션을 완료할 때까지 1-2단계를 반복합니다.",
    },
    {
      step: 4,
      title: "긴 휴식 (15-30분)",
      description:
        "4번의 작업 세션 후에는 더 긴 휴식을 취하세요. 이 시간은 뇌가 정보를 처리하고 재충전하는 데 중요합니다.",
    },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-900 p-5 rounded-lg border border-red-100 dark:border-red-900 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <Info className="h-4 w-4 text-red-600 dark:text-red-300" />
        </div>
        <h3 className="font-medium">포모도로 기법이란?</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        포모도로 기법은 1980년대 프란체스코 시릴로가 개발한 시간 관리
        방법론입니다. 25분 작업과 5분 휴식을 반복하여 집중력과 생산성을 높이는
        기법입니다.
      </p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm font-medium">
            포모도로 기법 단계
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {pomodoroSteps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-red-600 dark:text-red-300">
                      {step.step}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-sm font-medium">
            효과적인 사용 팁
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>작업 시작 전에 할 일 목록을 작성하세요.</li>
              <li>각 포모도로 세션에서 한 가지 작업에만 집중하세요.</li>
              <li>
                휴식 시간에는 정말로 휴식을 취하세요. 화면을 보는 것을 피하고
                몸을 움직이는 것이 좋습니다.
              </li>
              <li>
                하루에 완료할 수 있는 포모도로 세션 수를 파악하고 그에 맞게
                작업을 계획하세요.
              </li>
              <li>
                방해 요소가 생기면 기록해두고 다음 휴식 시간에 처리하세요.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-sm font-medium">
            주요 기능 소개
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium">긴 휴식 기능</span>: 설정한 작업
                세션 수 이후에 자동으로 긴 휴식 시간이 제공됩니다.
              </li>
              <li>
                <span className="font-medium">자동 시작</span>: 세션이 끝난 후
                다음 세션을 자동으로 시작할 수 있습니다.
              </li>
              <li>
                <span className="font-medium">브라우저 알림</span>: 세션이
                끝나면 브라우저 알림을 받을 수 있습니다.
              </li>
              <li>
                <span className="font-medium">일일 목표</span>: 하루에 완료하고
                싶은 작업 세션 수를 설정하고 진행 상황을 확인할 수 있습니다.
              </li>
              <li>
                <span className="font-medium">통계 기능</span>: 오늘 완료한 세션
                수와 집중 시간을 확인할 수 있습니다.
              </li>
              <li>
                <span className="font-medium">백그라운드 실행 모드</span>: 다른
                도구로 전환해도 타이머가 계속 작동합니다. (다른 웹사이트로
                이동하면 작동하지 않습니다)
              </li>
              {ENABLE_TEST_MODE_UI && (
                <li>
                  <span className="font-medium">테스트 모드</span>: 포모도로
                  타이머의 기능을 빠르게 테스트할 수 있는 모드입니다. 타이머
                  시간을 초 단위로 설정하여 전체 흐름을 확인할 수 있습니다.
                </li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
        {ENABLE_TEST_MODE_UI && (
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm font-medium">
              테스트 모드 사용법
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  테스트 모드는 포모도로 타이머의 기능을 빠르게 확인하기 위한
                  임시 기능입니다:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    우측 상단의 '테스트 모드' 버튼을 클릭하여 테스트 설정을
                    표시합니다.
                  </li>
                  <li>테스트 모드 스위치를 켜서 활성화합니다.</li>
                  <li>
                    원하는 테스트 시간을 초 단위로 설정합니다 (기본값: 10초).
                  </li>
                  <li>타이머를 시작하면 설정한 시간으로 작동합니다.</li>
                  <li>
                    타이머가 실행 중일 때 빨리감기 버튼을 클릭하면 타이머가
                    5초로 줄어듭니다.
                  </li>
                  <li>
                    테스트가 끝나면 테스트 모드를 비활성화하여 일반 모드로
                    돌아갑니다.
                  </li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
