"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shuffle,
  Plus,
  Trash2,
  ImageIcon,
  Type,
  Info,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ItemType = {
  id: string;
  content: string;
  type: "text" | "image";
  displayName?: string;
};

// 디버그 모드 전역 설정 추가 (코드레벨에서 수정 가능)
const DEBUG_MODE_ENABLED = false; // 배포용으로는 false, 개발 중 디버깅이 필요하면 true로 설정

// 이미지 업로드 컴포넌트
function ImageUploader({
  onImageSelect,
  isMobile,
}: {
  onImageSelect: (files: File[]) => void;
  isMobile: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(`uploader-${Date.now()}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setErrorMsg(null);
      setIsLoading(true);

      const files = e.target.files;
      if (!files || files.length === 0) {
        setIsLoading(false);
        return;
      }

      console.log(`선택된 파일: ${files.length}개`, {
        firstFile: files[0].name,
        type: files[0].type,
        size: files[0].size,
      });

      // 파일 크기 확인
      if (files[0].size > 10 * 1024 * 1024) {
        setErrorMsg("이미지 크기가 너무 큽니다 (10MB 이하만 가능)");
        setIsLoading(false);
        return;
      }

      // 미리보기 생성
      try {
        const url = URL.createObjectURL(files[0]);
        setPreviewUrl(url);
      } catch (error) {
        console.error("미리보기 생성 실패:", error);
      }

      // 파일 개수 설정
      setFileCount(files.length);

      // 부모 컴포넌트에 파일 전달
      const fileArray = Array.from(files);
      onImageSelect(fileArray);

      // 상태 업데이트
      setIsLoading(false);

      // 입력 필드 리셋 준비
      setInputKey(`uploader-${Date.now()}`);
    } catch (error) {
      console.error("파일 처리 중 오류:", error);
      setErrorMsg("파일 처리 중 오류가 발생했습니다");
      setIsLoading(false);
    }
  };

  // 클릭 시 파일 선택 다이얼로그 표시
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-10 bg-white dark:bg-gray-800"
          onClick={triggerFileInput}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {isMobile ? "갤러리에서 사진 선택" : "이미지 파일 선택"}
        </Button>

        <input
          ref={fileInputRef}
          key={inputKey}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl && (
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreviewUrl(null)}
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="px-3 py-2 text-sm text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 rounded">
          이미지 처리 중...
        </div>
      )}

      {errorMsg && (
        <div className="px-3 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded">
          {errorMsg}
        </div>
      )}

      {fileCount > 0 && !isLoading && !errorMsg && (
        <div className="px-3 py-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded">
          <span className="font-medium">{fileCount}개</span>의 이미지가 선택됨
        </div>
      )}
    </div>
  );
}

export default function RandomPicker() {
  const [items, setItems] = useState<ItemType[]>([
    { id: "1", content: "옵션 1", type: "text" },
    { id: "2", content: "옵션 2", type: "text" },
    { id: "3", content: "옵션 3", type: "text" },
    { id: "4", content: "옵션 4", type: "text" },
  ]);

  const [newItemContent, setNewItemContent] = useState<string>("");
  const [newItemType, setNewItemType] = useState<"text" | "image">("text");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [spinDuration, setSpinDuration] = useState<number>(3);
  const [bulkInput, setBulkInput] = useState<string>("");
  const [history, setHistory] = useState<
    { items: ItemType[]; selected: ItemType; timestamp: Date }[]
  >([]);
  const [showIndicator, setShowIndicator] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<string>("file-input-0");
  const [fileSelectionPending, setFileSelectionPending] =
    useState<boolean>(false);

  // 디버깅용 상태 추가
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(DEBUG_MODE_ENABLED);
  const [deviceInfo, setDeviceInfo] = useState<string>("");

  // 디버그 로그 함수
  const addDebugLog = (message: string) => {
    // DEBUG_MODE_ENABLED가 true일 때만 로그 추가
    if (DEBUG_MODE_ENABLED) {
      setDebugInfo((prev) => {
        const newLogs = [
          `${new Date().toLocaleTimeString()}: ${message}`,
          ...prev,
        ];
        return newLogs.slice(0, 15); // 최대 15개 로그만 유지
      });
    }
  };

  // 장치 정보 초기화
  useEffect(() => {
    try {
      const info = [
        `기기: ${navigator.userAgent}`,
        `화면: ${window.innerWidth}x${window.innerHeight}`,
        `픽셀비율: ${window.devicePixelRatio}`,
        `브라우저: ${navigator.vendor || "알 수 없음"}`,
        `플랫폼: ${navigator.platform || "알 수 없음"}`,
      ].join(" | ");

      setDeviceInfo(info);
      // DEBUG_MODE_ENABLED가 true일 때만 디버그 로그 생성
      if (DEBUG_MODE_ENABLED) {
        addDebugLog("장치 정보 초기화 완료");
      }
    } catch (error) {
      setDeviceInfo("장치 정보 가져오기 실패");
    }
  }, []);

  // 파일 시스템 접근 폴리필 (일부 모바일 브라우저에서 필요)
  useEffect(() => {
    // 모바일 환경에서 페이지 로딩 직후 파일 입력 초기화
    if (isMobile) {
      addDebugLog("모바일 환경 감지: 파일 입력 초기화");

      // 문서 클릭 시 파일 입력 권한 확보를 위한 처리
      const handleDocumentClick = () => {
        try {
          // 숨겨진 입력 생성 및 클릭 (권한 준비)
          const dummyInput = document.createElement("input");
          dummyInput.type = "file";
          dummyInput.style.position = "absolute";
          dummyInput.style.opacity = "0";
          dummyInput.style.pointerEvents = "none";
          document.body.appendChild(dummyInput);

          // 폴리필 목적으로만 호출하고 바로 제거 (실제 파일 선택 다이얼로그는 표시되지 않음)
          setTimeout(() => {
            document.body.removeChild(dummyInput);
          }, 300);
        } catch (error) {
          // 오류 무시
        }
      };

      // 한 번만 실행
      document.body.addEventListener("click", handleDocumentClick, {
        once: true,
      });

      return () => {
        document.body.removeEventListener("click", handleDocumentClick);
      };
    }
  }, [isMobile]);

  const rouletteRef = useRef<HTMLDivElement>(null);
  const rouletteContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const itemWidth = 150; // 각 항목의 대략적인 너비
  const itemGap = 16; // space-x-4 클래스의 간격 (1rem = 16px)
  const [currentSpeedProfile, setCurrentSpeedProfile] = useState<
    "slow" | "normal" | "fast" | "veryFast"
  >("normal");

  // 속도 프로필 정의
  const speedProfiles = {
    slow: "cubic-bezier(0.1, 0.7, 0.05, 1)", // 천천히 가속, 빠르게 감속
    normal: "cubic-bezier(0.2, 0.8, 0.05, 1)", // 중간 가속, 빠르게 감속
    fast: "cubic-bezier(0.25, 0.9, 0.03, 1)", // 빠르게 가속, 빠르게 감속
    veryFast: "cubic-bezier(0.3, 0.95, 0.02, 1)", // 매우 빠르게 가속, 매우 빠르게 감속
  } as const;

  // 모바일 환경 감지
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMobileDevice);
      addDebugLog(`모바일 환경 감지: ${isMobileDevice ? "예" : "아니오"}`);

      // 모바일 환경에서도 디버그 UI는 기본적으로 비활성화
      // 이전 코드: if (isMobileDevice) { setShowDebug(true); }
    };

    checkMobile();

    // 화면 크기 변경시 다시 확인
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 이미지 업로더에서 이미지 선택 시 호출되는 함수
  const handleImageSelected = (files: File[]) => {
    addDebugLog(`${files.length}`);

    if (files.length === 0) return;

    setImageFiles(files);
    setCurrentFileName(files[0].name);

    // 단일 이미지면 바로 미리보기 설정
    if (files.length === 1) {
      try {
        const objectUrl = URL.createObjectURL(files[0]);
        setImagePreview(objectUrl);
      } catch (error) {
        console.error("미리보기 생성 오류:", error);
      }
    }

    // 여러 이미지면 여러 이미지 추가 버튼 표시 상태로 설정
    console.log(`${files.length}개 이미지 선택됨`);
  };

  const addItem = () => {
    if (newItemType === "text" && !newItemContent.trim()) return;
    if (newItemType === "image" && !newItemContent.trim() && !imagePreview)
      return;

    addDebugLog("항목 추가 시작");

    if (newItemType === "image" && imagePreview) {
      try {
        const newItem: ItemType = {
          id: Date.now().toString(),
          content: imagePreview,
          type: "image",
          displayName: currentFileName || "이미지",
        };

        setItems((prev) => {
          const newItems = [...prev, newItem];
          addDebugLog(`이미지 항목 추가 성공 (총 항목: ${newItems.length}개)`);
          return newItems;
        });

        setImagePreview(null);
        setCurrentFileName("");
        setImageFiles([]);
        setFileInputKey(`reset-${Date.now()}`);
      } catch (error) {
        addDebugLog(`항목 추가 오류: ${error}`);
      }
    } else {
      try {
        const newItem: ItemType = {
          id: Date.now().toString(),
          content: newItemContent,
          type: newItemType,
        };

        setItems((prev) => {
          const newItems = [...prev, newItem];
          addDebugLog(`텍스트 항목 추가 성공 (총 항목: ${newItems.length}개)`);
          return newItems;
        });

        setNewItemContent("");
      } catch (error) {
        addDebugLog(`항목 추가 오류: ${error}`);
      }
    }
  };

  // 파일 입력 컨트롤을 초기화하는 함수
  const resetFileInput = () => {
    // 파일 입력 필드 초기화를 위한 임의의 값 설정
    const randomKey = Date.now().toString();
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      // 새로운 파일 입력 요소로 대체
      const parent = fileInput.parentNode;
      if (parent) {
        const newInput = document.createElement("input");
        newInput.id = "image-upload";
        newInput.type = "file";
        newInput.accept = "image/*";
        newInput.multiple = true;
        newInput.className = "hidden";
        newInput.setAttribute("key", randomKey);

        // 이벤트 리스너 추가
        newInput.addEventListener("change", (e) => {
          if (e.target && "files" in e.target) {
            const target = e.target as HTMLInputElement;
            if (target.files) {
              handleImageSelected(Array.from(target.files));
            }
          }
        });

        // 모바일 환경에서 캡처 옵션 추가
        if (isMobile) {
          newInput.setAttribute("capture", "environment");
        }

        // 기존 입력 필드 제거 및 새 필드 추가
        parent.removeChild(fileInput);
        parent.appendChild(newInput);

        console.log("파일 입력 컨트롤 초기화됨:", randomKey);
      }
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const processBulkInput = () => {
    if (!bulkInput.trim()) return;

    const newItems = bulkInput
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({
        id: Date.now() + Math.random().toString(),
        content: line.trim(),
        type: "text" as const,
      }));

    setItems([...items, ...newItems]);
    setBulkInput("");
  };

  const addMultipleImages = () => {
    if (imageFiles.length <= 1) {
      addDebugLog("다중 이미지 없음: 일반 추가로 진행");
      addItem(); // 단일 이미지는 일반 추가 함수 사용
      return;
    }

    addDebugLog(`${imageFiles.length}개 이미지 일괄 추가 시작`);

    try {
      // 안전하게 추가하기 위해 모든 파일을 순차적으로 처리
      const totalFiles = imageFiles.length;
      let addedCount = 0;
      let newItems: ItemType[] = [];

      // 모든 이미지를 동기적으로 처리
      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const file = imageFiles[i];
          const fileId = Date.now() + i;

          addDebugLog(
            `이미지 #${i + 1} 처리 중: ${file.name.substring(0, 15)}`
          );

          // 객체 URL 생성
          const objectUrl = URL.createObjectURL(file);

          // 새 항목 객체 생성
          const newItem: ItemType = {
            id: fileId.toString(),
            content: objectUrl,
            type: "image",
            displayName: file.name || `이미지 #${i + 1}`,
          };

          // 배열에 추가
          newItems.push(newItem);
          addedCount++;
        } catch (itemError) {
          addDebugLog(`이미지 #${i + 1} 처리 오류: ${itemError}`);
        }
      }

      // 모든 이미지 항목을 한 번에 상태에 추가
      setItems((prev) => {
        const updated = [...prev, ...newItems];
        addDebugLog(`총 ${addedCount}/${totalFiles}개 이미지 추가 완료`);
        return updated;
      });

      // 상태 초기화
      setImageFiles([]);
      setImagePreview(null);
      setCurrentFileName("");
      setFileInputKey(`batch-reset-${Date.now()}`);
    } catch (error) {
      addDebugLog(`일괄 추가 중 오류 발생: ${error}`);
    }
  };

  // 객체 URL 정리 기능 추가
  useEffect(() => {
    // 메모리 누수 방지를 위한 객체 URL 정리
    const objectUrlPattern = /^blob:/;

    return () => {
      // 컴포넌트 언마운트 시 모든 blob URL 정리
      items.forEach((item) => {
        if (
          item.type === "image" &&
          typeof item.content === "string" &&
          objectUrlPattern.test(item.content)
        ) {
          URL.revokeObjectURL(item.content);
          console.log("객체 URL 정리:", item.content);
        }
      });

      // 미리보기 이미지 URL 정리
      if (imagePreview && objectUrlPattern.test(imagePreview)) {
        URL.revokeObjectURL(imagePreview);
        console.log("미리보기 URL 정리:", imagePreview);
      }
    };
  }, []);

  const spin = () => {
    if (items.length < 2 || isSpinning) return;

    setIsSpinning(true);
    setSelectedItem(null);

    // 룰렛 애니메이션 시작
    if (rouletteRef.current && rouletteContainerRef.current) {
      const roulette = rouletteRef.current;
      const container = rouletteContainerRef.current;

      // 초기 위치 설정 (오른쪽에서 시작)
      roulette.style.transition = "none";
      roulette.style.transform = "translateX(0)";

      // 강제 리플로우
      void roulette.offsetWidth;

      // 전체 항목 너비 계산 (간격 포함)
      const totalItemWidth = itemWidth + itemGap;
      const totalWidth = items.length * totalItemWidth;

      // 랜덤하게 멈출 위치 결정 (전체 항목 범위 내에서)
      const randomOffset = Math.random() * totalWidth;
      const spinDistance = totalWidth * 3 + randomOffset; // 3바퀴 + 랜덤 오프셋

      // 애니메이션 설정
      const speedProfile = speedProfiles[currentSpeedProfile];
      roulette.style.transition = `transform ${spinDuration}s ${speedProfile}`;
      roulette.style.transform = `translateX(-${spinDistance}px)`;

      // 애니메이션 종료 후 중앙에 있는 항목 찾기
      setTimeout(() => {
        // DOM에서 직접 중앙에 가장 가까운 항목 찾기
        const findCenterItem = () => {
          if (!container || !indicatorRef.current) return null;

          // 중앙 표시선의 위치 계산
          const indicatorRect = indicatorRef.current.getBoundingClientRect();
          const indicatorCenter = indicatorRect.left + indicatorRect.width / 2;

          // 모든 항목 요소 가져오기
          const itemElements = Array.from(
            container.querySelectorAll(".roulette-item")
          );
          if (itemElements.length === 0) return null;

          // 디버깅을 위한 로그
          console.log(
            "중앙 표시선 위치:",
            indicatorCenter,
            "표시선 가시성:",
            showIndicator
          );

          // 중앙에 가장 가까운 항목 찾기
          let closestItem: ItemType | null = null;
          let minDistance = Number.MAX_VALUE;

          itemElements.forEach((itemElement) => {
            const itemRect = itemElement.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            const distance = Math.abs(itemCenter - indicatorCenter);

            // 디버깅을 위한 로그
            console.log(
              "항목:",
              itemElement.getAttribute("data-item-id"),
              "반복:",
              itemElement.getAttribute("data-repeat-index"),
              "위치:",
              itemCenter,
              "거리:",
              distance
            );

            if (distance < minDistance) {
              minDistance = distance;
              const itemId = itemElement.getAttribute("data-item-id");
              const repeatIndex = Number.parseInt(
                itemElement.getAttribute("data-repeat-index") || "0"
              );

              // 모든 반복 블록에서 가장 가까운 항목을 찾되, 항목 ID가 있는 경우만 선택
              if (itemId) {
                const foundItem = items.find((item) => item.id === itemId);
                if (foundItem) {
                  closestItem = foundItem;
                  console.log(
                    "현재 가장 가까운 항목:",
                    itemId,
                    "거리:",
                    distance
                  );
                }
              }
            }
          });

          // console.log("최종 선택된 항목:", closestItem && typeof closestItem === 'object' && 'id' in closestItem ? closestItem.id : null);
          return closestItem as ItemType | null;
        };

        // 중앙에 가장 가까운 항목 찾기
        const centerItem = findCenterItem();

        // 선택된 항목 설정
        if (centerItem) {
          setSelectedItem(centerItem);

          // 기록 추가
          setHistory(
            [
              {
                items: [...items],
                selected: centerItem,
                timestamp: new Date(),
              },
              ...history,
            ].slice(0, 10)
          );
        } else {
          // 중앙 항목을 찾지 못한 경우 랜덤으로 선택 (폴백)
          const randomIndex = Math.floor(Math.random() * items.length);
          const selected = items[randomIndex];
          setSelectedItem(selected);

          // 기록 추가
          setHistory(
            [
              { items: [...items], selected, timestamp: new Date() },
              ...history,
            ].slice(0, 10)
          );
        }

        setIsSpinning(false);
      }, spinDuration * 1000);
    }
  };

  const clearAllItems = () => {
    setItems([]);
    setSelectedItem(null);
  };

  // 매우 간단한 이미지 업로드 처리 함수로 교체
  const handleDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    // 디버그 로그 추가
    addDebugLog(`파일 선택 이벤트 발생`);

    if (!files || files.length === 0) {
      addDebugLog("선택된 파일 없음");
      return;
    }

    addDebugLog(`${files.length}개 파일 선택됨: ${files[0].name}`);

    // 파일 배열 저장
    const fileArray = Array.from(files);
    setImageFiles(fileArray);

    // 첫 번째 파일 미리보기 설정
    try {
      const file = files[0];
      setCurrentFileName(file.name);

      // 이미지 URL 생성
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      addDebugLog("이미지 미리보기 생성 성공");

      // 파일 입력 키 변경
      setFileInputKey(`file-key-${Date.now()}`);
    } catch (error) {
      addDebugLog(`오류 발생: ${error}`);
    }
  };

  // 대체 파일 입력 방식 추가
  const openFilePicker = () => {
    addDebugLog("파일 선택 다이얼로그 요청");

    // 직접 파일 입력 다이얼로그 생성 및 제어
    try {
      // 모바일에서 작동하는 파일 선택 방식
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      // 안드로이드 환경에서는 multiple 속성 비활성화 - 핵심 수정
      fileInput.multiple = !isMobile;

      // 안드로이드 디버깅을 위한 정보 추가
      addDebugLog(`multiple 속성: ${!isMobile ? "활성화" : "비활성화"}`);

      // 안드로이드에서는 capture 속성 삭제 (일부 기기에서 문제 발생)
      if (isMobile && /Android/i.test(navigator.userAgent)) {
        // 안드로이드에서는 기본 갤러리 접근 방식 사용
        addDebugLog("안드로이드 단순 선택 모드 활성화");
      }

      // 이미지 선택 이벤트 핸들러
      fileInput.addEventListener("change", (e) => {
        addDebugLog("파일 선택 이벤트 감지");

        if (!fileInput.files || fileInput.files.length === 0) {
          addDebugLog("선택된 파일 없음");
          return;
        }

        const files = fileInput.files;
        addDebugLog(`${files.length}개 파일 선택됨: ${files[0].name}`);

        // 파일 처리
        const fileArray = Array.from(files);
        setImageFiles(fileArray);
        setCurrentFileName(
          files.length === 1 ? files[0].name : `${files.length}개 이미지`
        );

        try {
          // PC에서 다중 이미지 선택일 경우
          if (!isMobile && files.length > 1) {
            // 첫 번째 이미지 미리보기만 설정
            const url = URL.createObjectURL(files[0]);
            setImagePreview(url);
            addDebugLog(`다중 이미지 선택됨: ${files.length}개`);

            // 이미지를 자동 추가하지 않고, 미리보기만 표시
            // 사용자가 '추가' 버튼을 클릭하면 addMultipleImages 함수가 실행됨
            return;
          }

          // 모바일이거나 단일 이미지 선택인 경우
          const url = URL.createObjectURL(files[0]);
          setImagePreview(url);
          addDebugLog("미리보기 URL 생성 성공");

          // 모바일에서만 자동 추가 (단일 이미지만 지원)
          if (isMobile) {
            try {
              const newItem: ItemType = {
                id: Date.now().toString(),
                content: url,
                type: "image",
                displayName: files[0].name || "이미지",
              };

              setItems((prev) => {
                const newItems = [...prev, newItem];
                addDebugLog(
                  `이미지 항목 자동 추가 성공 (총 항목: ${newItems.length}개)`
                );
                return newItems;
              });

              // 상태 초기화
              setTimeout(() => {
                setImagePreview(null);
                setCurrentFileName("");
                setImageFiles([]);
                setFileInputKey(`auto-reset-${Date.now()}`);
              }, 500);
            } catch (addError) {
              addDebugLog(`자동 항목 추가 오류: ${addError}`);
            }
          }
        } catch (previewError) {
          addDebugLog(`미리보기 생성 실패: ${previewError}`);
        }
      });

      // 파일 선택 대화상자 표시
      document.body.appendChild(fileInput);
      fileInput.click();

      // 정리
      setTimeout(() => {
        document.body.removeChild(fileInput);
      }, 1000);
    } catch (error) {
      addDebugLog(`파일 선택기 오류: ${error}`);

      // 폴백: 기본 입력 사용
      const defaultInput = document.getElementById(
        "simple-image-upload"
      ) as HTMLInputElement;
      if (defaultInput) defaultInput.click();
    }
  };

  // 테스트 이미지 추가 (폴백 기능)
  const addTestImage = () => {
    try {
      addDebugLog("대체 테스트 이미지 추가 중");

      // 간단한 캔버스 이미지 생성
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // 배경
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 시간을 포함한 텍스트로 고유성 보장
        const time = new Date().toLocaleTimeString();
        ctx.fillStyle = "#000000";
        ctx.font = "16px Arial";
        ctx.fillText(`테스트 이미지 ${time}`, 20, 100);

        // 데이터 URL로 변환
        const dataUrl = canvas.toDataURL("image/png");

        // 테스트 이미지 추가
        const newItem: ItemType = {
          id: Date.now().toString(),
          content: dataUrl,
          type: "image",
          displayName: "테스트 이미지",
        };

        setItems((prev) => [...prev, newItem]);
        addDebugLog("테스트 이미지 추가 성공");
      } else {
        addDebugLog("캔버스 컨텍스트를 가져올 수 없음");
      }
    } catch (error) {
      addDebugLog(`테스트 이미지 생성 오류: ${error}`);
    }
  };

  // 안드로이드 Chrome 호환성을 위한 응급 수정
  useEffect(() => {
    if (isMobile) {
      // 모든 인풋 요소에 직접 DOM으로 접근하여 처리
      try {
        const setupFileInputs = () => {
          addDebugLog("안드로이드 호환성 모드 활성화");

          // 기존 인풋 요소를 찾아서 새 이벤트 리스너 추가
          const fileInputs = document.querySelectorAll('input[type="file"]');

          fileInputs.forEach((input, index) => {
            const inputElement = input as HTMLInputElement;

            // 기존 이벤트 리스너 제거 (가능한 경우)
            const newInput = inputElement.cloneNode(true) as HTMLInputElement;
            if (inputElement.parentNode) {
              inputElement.parentNode.replaceChild(newInput, inputElement);

              addDebugLog(`파일 입력 #${index} 재초기화됨`);
            }
          });
        };

        // DOM이 완전히 로드된 후 실행
        setTimeout(setupFileInputs, 500);
      } catch (error) {
        addDebugLog(`안드로이드 호환성 모드 오류: ${error}`);
      }
    }
  }, [isMobile]);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300">
          랜덤 선택기
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          여러 옵션 중에서 랜덤으로 하나를 선택하세요. 룰렛 효과와 함께 재미있게
          결정할 수 있습니다.
        </p>

        {/* 디버그 모드 토글 버튼 - DEBUG_MODE_ENABLED가 true일 때만 표시 */}
        {DEBUG_MODE_ENABLED && (
          <div className="flex justify-center mt-2">
            <Button
              variant={showDebug ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setShowDebug(!showDebug);
                addDebugLog(`디버그 모드 ${showDebug ? "비활성화" : "활성화"}`);
              }}
              className="text-xs px-2 py-1 h-7"
            >
              {showDebug ? "디버그 모드 끄기" : "디버그 모드 켜기"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="md:w-2/3">
          <Card className="w-full bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-purple-50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-2">
                <Shuffle className="h-6 w-6 text-purple-500" />
                <CardTitle>Random Picker</CardTitle>
              </div>
              <CardDescription>
                옵션을 추가하고 룰렛을 돌려 랜덤하게 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="roulette" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="roulette">Roulette</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="roulette" className="space-y-6">
                  {/* 룰렛 영역 */}
                  <div
                    ref={rouletteContainerRef}
                    className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-40 flex items-center"
                  >
                    {/* 중앙 표시기 - 항상 DOM에 존재하지만 시각적으로만 숨김 */}
                    <div
                      ref={indicatorRef}
                      className={`absolute left-1/2 top-0 bottom-0 w-0.5 ${
                        showIndicator ? "bg-red-500" : "bg-transparent"
                      } z-10 transform -translate-x-1/2`}
                    ></div>

                    {/* 룰렛 컨테이너 */}
                    <div
                      ref={rouletteRef}
                      className="flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {items.length > 0 ? (
                        <>
                          {/* 항목 5번 반복 (무한 스크롤 효과) */}
                          {[...Array(5)].map((_, repeatIndex) => (
                            <React.Fragment key={`repeat-${repeatIndex}`}>
                              {items.map((item, itemIndex) => (
                                <div
                                  key={`${repeatIndex}-${item.id}`}
                                  className={`roulette-item flex-shrink-0 w-32 h-32 rounded-lg flex items-center justify-center p-2 text-center
                                    ${
                                      selectedItem?.id === item.id &&
                                      repeatIndex === 2
                                        ? "bg-purple-200 dark:bg-purple-800 border-2 border-purple-500"
                                        : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                    }`}
                                  data-item-id={item.id}
                                  data-repeat-index={repeatIndex}
                                  data-item-index={itemIndex}
                                >
                                  {item.type === "text" ? (
                                    <span className="text-sm font-medium break-words">
                                      {item.content}
                                    </span>
                                  ) : (
                                    <img
                                      src={item.content || "/placeholder.svg"}
                                      alt="Item"
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/placeholder.svg?height=100&width=100";
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </React.Fragment>
                          ))}
                        </>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                          항목을 추가해주세요
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 선택 결과 */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                    {selectedItem ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          선택된 항목:
                        </p>
                        <div className="font-bold text-xl text-purple-600 dark:text-purple-400">
                          {selectedItem.type === "text" ? (
                            selectedItem.content
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <img
                                src={selectedItem.content || "/placeholder.svg"}
                                alt="Selected item"
                                className="h-20 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.svg?height=80&width=80";
                                }}
                              />
                              <span className="text-sm">
                                {selectedItem.displayName || "이미지"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        {isSpinning
                          ? "선택 중..."
                          : "룰렛을 돌려 항목을 선택하세요"}
                      </p>
                    )}
                  </div>

                  {/* 설정 및 버튼 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="spin-duration">회전 시간 (초)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="spin-duration"
                            type="number"
                            min="1"
                            max="10"
                            value={spinDuration}
                            onChange={(e) =>
                              setSpinDuration(Number(e.target.value))
                            }
                            className="w-20"
                            disabled={isSpinning}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="speed-profile">회전 속도 프로필</Label>
                        <Select
                          value={currentSpeedProfile}
                          onValueChange={(
                            value: "slow" | "normal" | "fast" | "veryFast"
                          ) => setCurrentSpeedProfile(value)}
                          disabled={isSpinning}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="속도 프로필 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">천천히</SelectItem>
                            <SelectItem value="normal">보통</SelectItem>
                            <SelectItem value="fast">빠르게</SelectItem>
                            <SelectItem value="veryFast">
                              매우 빠르게
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="show-indicator" className="text-sm">
                          중앙 표시선
                        </Label>
                        <Switch
                          id="show-indicator"
                          checked={showIndicator}
                          onCheckedChange={setShowIndicator}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={spin}
                      disabled={items.length < 2 || isSpinning}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      룰렛 돌리기
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-6">
                  {/* 항목 추가 - 전면 UI 개선 */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        새 항목 추가
                      </h3>

                      <div className="flex flex-col space-y-3">
                        {/* 항목 타입 선택 버튼 */}
                        <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => {
                              setNewItemType("text");
                              setImageFiles([]);
                              setImagePreview(null);
                            }}
                            className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 text-sm ${
                              newItemType === "text"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-medium"
                                : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <Type className="h-4 w-4" />
                            <span>텍스트</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewItemType("image")}
                            className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 text-sm ${
                              newItemType === "image"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-medium"
                                : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <ImageIcon className="h-4 w-4" />
                            <span>이미지</span>
                          </button>
                        </div>

                        {/* 텍스트 또는 이미지 선택에 따른 입력 UI */}
                        {newItemType === "text" ? (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                id="new-item"
                                value={newItemContent}
                                onChange={(e) =>
                                  setNewItemContent(e.target.value)
                                }
                                placeholder="항목 내용 입력..."
                                className="flex-1"
                              />
                              <Button
                                onClick={addItem}
                                disabled={!newItemContent.trim()}
                                className="px-4"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                추가
                              </Button>
                            </div>

                            {/* 여러 항목 한 번에 추가 - 텍스트 모드에 통합 */}
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                여러 항목 한 번에 추가
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                줄바꿈으로 구분된 항목을 한 번에 추가할 수
                                있습니다
                              </p>
                              <Textarea
                                id="bulk-input"
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                placeholder="항목 1&#10;항목 2&#10;항목 3"
                                className="min-h-[100px] mb-3"
                              />
                              <Button
                                onClick={processBulkInput}
                                variant="outline"
                                className="w-full"
                                disabled={!bulkInput.trim()}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                대량 추가 (
                                {
                                  bulkInput
                                    .split("\n")
                                    .filter((line) => line.trim()).length
                                }
                                개 항목)
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* 이미지 선택 버튼 */}
                            <button
                              type="button"
                              onClick={() => {
                                addDebugLog("이미지 선택 버튼 클릭");
                                openFilePicker();
                              }}
                              className="w-full h-12 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                              <ImageIcon className="h-5 w-5" />
                              <span>
                                {isMobile
                                  ? "클릭하여 사진 선택"
                                  : "클릭하여 이미지 파일 선택"}
                              </span>
                            </button>

                            {/* 이미지 미리보기 */}
                            {newItemType === "image" && imagePreview && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-md bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={imagePreview}
                                    alt="미리보기"
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">
                                    {currentFileName || "선택된 이미지"}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {imageFiles.length > 1
                                      ? `${imageFiles.length}개의 이미지 선택됨`
                                      : "클릭하여 항목으로 추가"}
                                  </p>
                                  <div className="flex gap-2 mt-1">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => {
                                        if (
                                          imageFiles.length > 1 &&
                                          !isMobile
                                        ) {
                                          addMultipleImages();
                                        } else {
                                          addItem();
                                        }
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      {imageFiles.length > 1 && !isMobile
                                        ? "모두 추가"
                                        : "추가"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setImagePreview(null);
                                        setImageFiles([]);
                                        setCurrentFileName("");
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 기존 input은 유지 (폴백용) */}
                        <input
                          id="simple-image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleDirectImageUpload}
                          className="hidden"
                          key={fileInputKey}
                        />
                      </div>
                    </div>

                    {/* 항목 목록 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          항목 목록{" "}
                          <span className="text-purple-600 dark:text-purple-400">
                            ({items.length}개)
                          </span>
                        </h3>
                        {items.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllItems}
                            className="h-8 text-red-500 text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            모두 지우기
                          </Button>
                        )}
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                        {items.length > 0 ? (
                          items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {item.type === "image" ? (
                                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={item.content || "/placeholder.svg"}
                                      alt="Item"
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/placeholder.svg?height=32&width=32";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex-shrink-0 flex items-center justify-center">
                                    <Type className="h-4 w-4 text-purple-500" />
                                  </div>
                                )}
                                <span className="truncate">
                                  {item.type === "image"
                                    ? item.displayName || "이미지"
                                    : item.content}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-7 w-7 rounded-full p-0 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            항목이 없습니다. 위에서 항목을 추가해주세요.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-2">
                    <Label>선택 기록</Label>
                    <div className="max-h-[400px] overflow-y-auto space-y-3">
                      {history.length > 0 ? (
                        history.map((record, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                {record.timestamp.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                총 {record.items.length}개 항목 중 선택
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="font-medium">선택됨:</div>
                              <div className="flex items-center space-x-2">
                                {record.selected.type === "image" ? (
                                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={
                                        record.selected.content ||
                                        "/placeholder.svg"
                                      }
                                      alt="Selected item"
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/placeholder.svg?height=32&width=32";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex-shrink-0 flex items-center justify-center">
                                    <Type className="h-4 w-4 text-purple-500" />
                                  </div>
                                )}
                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                  {record.selected.type === "image"
                                    ? record.selected.displayName || "이미지"
                                    : record.selected.content}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          아직 선택 기록이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6">
              <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
                {items.length < 2
                  ? "룰렛을 돌려면 최소 2개 이상의 항목이 필요합니다."
                  : `${items.length}개의 항목 중에서 랜덤하게 선택합니다.`}
              </div>
            </CardFooter>

            {/* 디버그 정보 표시 패널 - DEBUG_MODE_ENABLED가 true이고 showDebug가 true일 때만 표시 */}
            {DEBUG_MODE_ENABLED && showDebug && (
              <div className="border-t-4 border-red-500 dark:border-red-700 p-4 bg-red-50 dark:bg-red-950/50 relative">
                <div className="absolute top-0 right-0 left-0 h-1 bg-red-500 dark:bg-red-700 animate-pulse"></div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                    모바일 디버그 패널
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        addDebugLog(
                          `현재 상태 확인: 이미지=${imageFiles.length}개, 항목=${items.length}개`
                        );
                        addDebugLog(`파일 키: ${fileInputKey}`);
                      }}
                    >
                      상태 확인
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setDebugInfo([])}
                    >
                      로그 지우기
                    </Button>
                  </div>
                </div>

                {/* 장치 정보 표시 */}
                <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2 rounded mb-2 overflow-x-auto whitespace-nowrap">
                  {deviceInfo || "장치 정보 없음"}
                </div>

                <div className="text-xs text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 p-2 rounded max-h-40 overflow-y-auto">
                  {debugInfo.length > 0 ? (
                    <ul className="space-y-1">
                      {debugInfo.map((log, index) => (
                        <li
                          key={index}
                          className="border-b border-red-100 dark:border-red-900 pb-1 mb-1 last:border-0"
                        >
                          {log}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      아직 로그가 없습니다. 이미지 선택 시 여기에 정보가
                      표시됩니다.
                    </p>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                    onClick={addTestImage}
                  >
                    테스트 이미지 생성
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      openFilePicker();
                    }}
                  >
                    대체 파일 선택기
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-purple-100 dark:border-purple-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Info className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="font-medium">랜덤 선택기 사용법</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Items 탭에서 선택할 항목들을 추가하세요.</li>
              <li>텍스트나 이미지 URL을 입력할 수 있습니다.</li>
              <li>Roulette 탭으로 이동하여 '룰렛 돌려기' 버튼을 클릭하세요.</li>
              <li>룰렛이 회전한 후 랜덤하게 선택된 항목이 표시됩니다.</li>
              <li>History 탭에서 이전 선택 결과를 확인할 수 있습니다.</li>
            </ol>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full bg-white dark:bg-gray-900 rounded-lg border border-purple-100 dark:border-purple-900 shadow-sm"
          >
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  <span>자주 묻는 질문</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-3 space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    이미지는 어떻게 추가하나요?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Items 탭에서 이미지 아이콘을 클릭한 후 이미지 URL을
                    입력하세요.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    여러 항목을 한 번에 추가할 수 있나요?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    네, Items 탭의 '여러 항목 한 번에 추가' 영역에 줄바꿈으로
                    구분하여 입력하세요.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    선택 결과는 저장되나요?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    History 탭에서 최근 10개의 선택 결과를 확인할 수 있습니다.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-purple-100 dark:border-purple-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="font-medium">활용 아이디어</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>팀 프로젝트에서 역할 분담하기</li>
              <li>오늘의 점심 메뉴 고르기</li>
              <li>게임에서 다음 차례 정하기</li>
              <li>여행지 선택하기</li>
              <li>결정하기 어려운 선택지 중에서 고르기</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
