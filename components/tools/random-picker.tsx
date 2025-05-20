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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageFiles(Array.from(files));

    // 첫 번째 파일 미리보기 설정
    const firstFile = files[0];
    setCurrentFileName(firstFile.name);

    // 이미지 파일을 Base64 문자열로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(firstFile);
  };

  const addItem = () => {
    if (newItemType === "text" && !newItemContent.trim()) return;
    if (newItemType === "image" && !newItemContent.trim() && !imagePreview)
      return;

    if (newItemType === "image" && imagePreview) {
      const newItem: ItemType = {
        id: Date.now().toString(),
        content: imagePreview,
        type: "image",
        displayName: currentFileName || "이미지",
      };

      setItems([...items, newItem]);
      setImagePreview(null);
      setCurrentFileName("");
    } else {
      const newItem: ItemType = {
        id: Date.now().toString(),
        content: newItemContent,
        type: newItemType,
      };

      setItems([...items, newItem]);
    }

    setNewItemContent("");
    setImageFiles([]);
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
    if (imageFiles.length === 0) return;

    const processFile = (index: number) => {
      if (index >= imageFiles.length) {
        setImageFiles([]);
        setImagePreview(null);
        setCurrentFileName("");
        return;
      }

      const file = imageFiles[index];
      const reader = new FileReader();

      reader.onloadend = () => {
        const newItem: ItemType = {
          id: Date.now() + index.toString(),
          content: reader.result as string,
          type: "image",
          displayName: file.name,
        };

        setItems((prev) => [...prev, newItem]);
        processFile(index + 1);
      };

      reader.readAsDataURL(file);
    };

    processFile(0);
  };

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
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="속도 프로필 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">천천히 (Slow)</SelectItem>
                            <SelectItem value="normal">
                              보통 (Normal)
                            </SelectItem>
                            <SelectItem value="fast">빠르게 (Fast)</SelectItem>
                            <SelectItem value="veryFast">
                              매우 빠르게 (Very Fast)
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
                  {/* 항목 추가 */}
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="new-item">새 항목 추가</Label>
                        {newItemType === "text" ? (
                          <Input
                            id="new-item"
                            value={newItemContent}
                            onChange={(e) => setNewItemContent(e.target.value)}
                            placeholder="항목 내용 입력..."
                          />
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                id="new-item"
                                value={newItemContent}
                                onChange={(e) =>
                                  setNewItemContent(e.target.value)
                                }
                                placeholder="이미지 URL 입력..."
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                또는
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="flex-1"
                              />
                              {imagePreview && (
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                                  <img
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-10 w-10 ${
                            newItemType === "text"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : ""
                          }`}
                          onClick={() => {
                            setNewItemType("text");
                            setImageFiles([]);
                            setImagePreview(null);
                          }}
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-10 w-10 ${
                            newItemType === "image"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : ""
                          }`}
                          onClick={() => setNewItemType("image")}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button onClick={addItem} className="h-10">
                          <Plus className="h-4 w-4" />
                          추가
                        </Button>
                      </div>
                    </div>

                    {imageFiles.length > 1 && (
                      <Button
                        onClick={addMultipleImages}
                        variant="outline"
                        className="mt-2 w-full"
                      >
                        {imageFiles.length}개 이미지 모두 추가
                      </Button>
                    )}

                    {/* 대량 추가 */}
                    <div className="space-y-2">
                      <Label htmlFor="bulk-input">
                        여러 항목 한 번에 추가 (줄바꿈으로 구분)
                      </Label>
                      <Textarea
                        id="bulk-input"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="항목 1&#10;항목 2&#10;항목 3"
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={processBulkInput}
                        variant="outline"
                        className="w-full"
                      >
                        대량 추가
                      </Button>
                    </div>

                    {/* 항목 목록 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>항목 목록 ({items.length}개)</Label>
                        {items.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllItems}
                            className="h-8 text-red-500"
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
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <div className="flex items-center space-x-2 overflow-hidden">
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
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 text-red-500"
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
                  ? "룰렛을 돌리려면 최소 2개 이상의 항목이 필요합니다."
                  : `${items.length}개의 항목 중에서 랜덤하게 선택합니다.`}
              </div>
            </CardFooter>
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
              <li>Roulette 탭으로 이동하여 '룰렛 돌리기' 버튼을 클릭하세요.</li>
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
