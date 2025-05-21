"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { SessionIndicator } from "./SessionIndicator";
import { DailyGoalProgress } from "./DailyGoalProgress";
import { NotificationAlert } from "./NotificationAlert";
import { SettingsPanel } from "./SettingsPanel";
import { HistoryPanel } from "./HistoryPanel";
import { StatsPanel } from "./StatsPanel";

interface TimerTabsProps {
  className?: string;
}

export function TimerTabs({ className }: TimerTabsProps) {
  return (
    <Tabs defaultValue="timer" className={`w-full ${className}`}>
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="timer">Timer</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="timer" className="space-y-6">
        <TimerDisplay />
        <TimerControls />
        <SessionIndicator />
        <DailyGoalProgress />
        <NotificationAlert />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <SettingsPanel />
      </TabsContent>

      <TabsContent value="history">
        <HistoryPanel />
      </TabsContent>

      <TabsContent value="stats" className="space-y-4">
        <StatsPanel />
      </TabsContent>
    </Tabs>
  );
}
