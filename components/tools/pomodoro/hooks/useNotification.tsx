"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DOMAIN_CONFIG } from "@/lib/constants";
import { NotificationPermissionType } from "../types";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  requireInteraction?: boolean;
}

export function useNotification() {
  // 알림 관련 상태
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5); // 기본 볼륨 50%
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionType>("default");

  // 참조
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<Notification | null>(null);

  // 알림 권한 초기화
  useEffect(() => {
    // 오디오 요소 생성
    if (typeof window !== "undefined") {
      // 메인 도메인을 기반으로 오디오 파일 URL 생성
      const audioUrl = `${DOMAIN_CONFIG.getMainUrl()}/sounds/notification.mp3`;
      audioRef.current = new Audio(audioUrl);
    }

    // 알림 권한 확인 및 상태 설정
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = Notification.permission;
        setNotificationPermission(permission as NotificationPermissionType);
      } catch (error) {
        console.error("알림 권한 확인 중 오류:", error);
        setNotificationPermission("default");
      }
    }

    return () => {
      // 알림 정리
      if (notificationRef.current) {
        notificationRef.current.close();
      }
    };
  }, []);

  // 소리 알림 재생
  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .catch((e) => console.error("오디오 재생 실패:", e));
    }
  }, [soundEnabled, volume]);

  // 브라우저 알림 표시
  const showBrowserNotification = useCallback(
    (options: NotificationOptions) => {
      if (
        showNotification &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        if (Notification.permission === "granted") {
          try {
            // 기존 알림이 있으면 닫기
            if (notificationRef.current) {
              notificationRef.current.close();
            }

            // 아이콘 경로 설정
            const iconUrl =
              options.icon || `${DOMAIN_CONFIG.getMainUrl()}/favicon.ico`;

            // 새 알림 생성
            notificationRef.current = new Notification(options.title, {
              body: options.body,
              icon: iconUrl,
              requireInteraction: options.requireInteraction || true,
            });

            // 알림 클릭 이벤트
            notificationRef.current.onclick = () => {
              window.focus();
              if (notificationRef.current) {
                notificationRef.current.close();
              }
            };

            // 5초 후 알림 닫기
            setTimeout(() => {
              if (notificationRef.current) {
                notificationRef.current.close();
              }
            }, 5000);

            return true;
          } catch (e) {
            console.error("알림 생성 실패:", e);
            return false;
          }
        }
      }
      return false;
    },
    [showNotification]
  );

  // 알림 발송 (소리 + 브라우저 알림)
  const sendNotification = useCallback(
    (options: NotificationOptions) => {
      // 소리 알림
      playSound();

      // 브라우저 알림
      return showBrowserNotification(options);
    },
    [playSound, showBrowserNotification]
  );

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
        .then((permission) => {
          setNotificationPermission(permission as NotificationPermissionType);

          if (permission === "granted") {
            setShowNotification(true);
            // 테스트 알림 표시
            try {
              const iconUrl = `${DOMAIN_CONFIG.getMainUrl()}/favicon.ico`;
              const notification = new Notification("알림 테스트", {
                body: "알림이 성공적으로 활성화되었습니다.",
                icon: iconUrl,
              });
            } catch (error) {
              console.error("테스트 알림 생성 실패:", error);
            }
          } else if (permission === "denied") {
            alert(
              "알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 변경할 수 있습니다."
            );
          }
        })
        .catch((error) => {
          console.error("알림 권한 요청 중 오류 발생:", error);
          alert("알림 권한을 요청하는 중 오류가 발생했습니다.");
        });
    } else {
      alert("이 브라우저는 알림 기능을 지원하지 않습니다.");
    }
  }, []);

  // 브라우저 설정 안내
  const openBrowserSettings = useCallback(() => {
    // 브라우저별 알림 설정 페이지 안내
    const isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
    const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
    const isEdge = navigator.userAgent.indexOf("Edg") !== -1;
    const isSafari =
      navigator.userAgent.indexOf("Safari") !== -1 &&
      navigator.userAgent.indexOf("Chrome") === -1;

    let message = "브라우저 설정에서 알림 권한을 변경하려면:\n\n";

    if (isChrome || isEdge) {
      message += "1. 주소창 왼쪽의 자물쇠(또는 정보) 아이콘을 클릭하세요.\n";
      message += "2. '사이트 설정' 또는 '권한'을 클릭하세요.\n";
      message += "3. '알림' 설정을 '허용'으로 변경하세요.";
    } else if (isFirefox) {
      message += "1. 주소창 왼쪽의 정보 아이콘을 클릭하세요.\n";
      message += "2. '권한 편집' 버튼을 클릭하세요.\n";
      message += "3. '알림 보내기' 설정을 '허용'으로 변경하세요.";
    } else if (isSafari) {
      message += "1. Safari 메뉴에서 '환경설정'을 클릭하세요.\n";
      message += "2. '웹사이트' 탭을 선택하세요.\n";
      message +=
        "3. 왼쪽에서 '알림'을 선택하고 이 웹사이트의 권한을 '허용'으로 변경하세요.";
    } else {
      message +=
        "브라우저의 설정 메뉴에서 알림 권한을 찾아 이 웹사이트에 대한 권한을 '허용'으로 변경하세요.";
    }

    alert(message);
  }, []);

  return {
    // 상태
    soundEnabled,
    volume,
    showNotification,
    notificationPermission,

    // 액션
    setSoundEnabled,
    setVolume,
    setShowNotification,
    playSound,
    sendNotification,
    requestNotificationPermission,
    openBrowserSettings,
  };
}
