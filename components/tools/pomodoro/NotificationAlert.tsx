"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePomodoroContext } from "./PomodoroContext";

interface NotificationAlertProps {
  className?: string;
}

export function NotificationAlert({ className }: NotificationAlertProps) {
  const {
    showNotification,
    notificationPermission,
    requestNotificationPermission,
    openBrowserSettings,
  } = usePomodoroContext();

  if (!showNotification) return null;

  return (
    <Alert className={`mt-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {notificationPermission === "default"
          ? "알림 권한이 필요합니다"
          : notificationPermission === "denied"
          ? "알림 권한이 거부되었습니다"
          : "알림이 활성화되었습니다"}
      </AlertTitle>
      <AlertDescription>
        {notificationPermission === "default" ? (
          <>
            <p className="mb-2">
              타이머 완료 시 알림을 받으려면 알림 권한을 허용해주세요.
            </p>
            <Button size="sm" onClick={requestNotificationPermission}>
              알림 허용하기
            </Button>
          </>
        ) : notificationPermission === "denied" ? (
          <>
            <p className="mb-2">
              브라우저에서 알림이 차단되어 있습니다. 브라우저 설정에서 알림
              권한을 변경해주세요.
            </p>
            <Button size="sm" onClick={openBrowserSettings}>
              브라우저 설정 안내
            </Button>
          </>
        ) : (
          <p>타이머 완료 시 알림을 받을 수 있습니다.</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
