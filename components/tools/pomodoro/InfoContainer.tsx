"use client";

import React from "react";
import { PomodoroInfo } from "./PomodoroInfo";
import { AdditionalInfo } from "./AdditionalInfo";

interface InfoContainerProps {
  className?: string;
}

export function InfoContainer({ className }: InfoContainerProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <PomodoroInfo />
      <AdditionalInfo />
    </div>
  );
}
