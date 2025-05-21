"use client";

import React from "react";
import { HelpCircle, Lightbulb, AlertCircle } from "lucide-react";

interface AdditionalInfoProps {
  className?: string;
}

export function AdditionalInfo({ className }: AdditionalInfoProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
          </div>
          <h3 className="font-medium">왜 포모도로인가요?</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          '포모도로'는 이탈리아어로 토마토를 의미합니다. 개발자가 주방 타이머로
          토마토 모양의 타이머를 사용했기 때문에 이 이름이 붙었습니다. 이 기법은
          집중력 향상, 작업 효율성 증가, 번아웃 방지에 효과적입니다.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-red-600 dark:text-red-300" />
          </div>
          <h3 className="font-medium">알고 계셨나요?</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          연구에 따르면 인간의 집중력은 약 25분 후에 자연스럽게 감소하기
          시작합니다. 포모도로 기법의 25분 작업 시간은 이러한 인지 과학 연구를
          기반으로 설계되었습니다.
        </p>
      </div>
    </div>
  );
}
