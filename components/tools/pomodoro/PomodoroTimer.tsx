"use client";

import React from "react";
import { TimerContainer } from "./TimerContainer";
import { InfoContainer } from "./InfoContainer";

export default function PomodoroTimer() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-300">
          집중력 향상을 위한 포모도로 타이머
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          포모도로 기법을 활용하여 작업 효율성을 높이고 번아웃을 방지하세요.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="md:w-1/2">
          <TimerContainer />
        </div>
        <div className="md:w-1/2">
          <InfoContainer />
        </div>
      </div>
    </div>
  );
}
