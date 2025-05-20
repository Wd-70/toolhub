"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Copy,
  Check,
  Plus,
  Trash2,
  Info,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToolState } from "@/hooks/use-tool-state";

// 컬러 피커 상태 타입 정의
interface ColorPickerState {
  currentColor: string;
  savedColors: string[];
  hue: number;
  saturation: number;
  lightness: number;
}

// 기본 상태 값
const defaultColorPickerState: ColorPickerState = {
  currentColor: "#6d28d9",
  savedColors: ["#6d28d9", "#db2777", "#0ea5e9", "#10b981", "#f59e0b"],
  hue: 270,
  saturation: 70,
  lightness: 50,
};

export default function ColorPicker() {
  // useToolState 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();

  // 도구 상태 가져오기
  const toolState = getToolState<ColorPickerState>("color-picker");
  const state = toolState?.data || defaultColorPickerState;

  // 로컬 상태 (컨텍스트에서 관리할 상태)
  const [currentColor, setCurrentColor] = useState<string>(state.currentColor);
  const [savedColors, setSavedColors] = useState<string[]>(state.savedColors);
  const [hue, setHue] = useState<number>(state.hue);
  const [saturation, setSaturation] = useState<number>(state.saturation);
  const [lightness, setLightness] = useState<number>(state.lightness);
  const [copied, setCopied] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // 상태 업데이트 함수 - 상태 변경을 Context에 저장
  const updateColorPickerState = () => {
    // 현재 상태를 Context에 저장
    updateToolState<ColorPickerState>("color-picker", {
      currentColor,
      savedColors,
      hue,
      saturation,
      lightness,
    });
  };

  useEffect(() => {
    // 클라이언트 사이드 체크
    setIsClient(true);

    // 도구 열림 이벤트 기록
    addHistoryEntry("color-picker", "open");

    // 컴포넌트 언마운트 시 도구 닫힘 이벤트 기록
    return () => {
      addHistoryEntry("color-picker", "close");
    };
  }, []);

  // 상태가 변경될 때마다 Context 업데이트
  useEffect(() => {
    if (isClient) {
      updateColorPickerState();
    }
  }, [currentColor, savedColors, hue, saturation, lightness, isClient]);

  const updateHSL = () => {
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    setCurrentColor(hslToHex(hue, saturation, lightness));

    // 업데이트 이벤트 기록
    addHistoryEntry("color-picker", "update");
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHSL = (hex: string): [number, number, number] => {
    // 간단한 변환 함수 (실제 구현에서는 더 정확한 변환 로직 사용)
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h *= 60;
    }

    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    const [h, s, l] = hexToHSL(newColor);
    setHue(h);
    setSaturation(s);
    setLightness(l);

    // 업데이트 이벤트 기록
    addHistoryEntry("color-picker", "update");
  };

  const saveColor = () => {
    if (!savedColors.includes(currentColor)) {
      setSavedColors([...savedColors, currentColor]);

      // 업데이트 이벤트 기록
      addHistoryEntry("color-picker", "update");
    }
  };

  const removeColor = (color: string) => {
    setSavedColors(savedColors.filter((c) => c !== color));

    // 업데이트 이벤트 기록
    addHistoryEntry("color-picker", "update");
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const newColors = [];

    // 유사색 팔레트 생성
    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + i * 15) % 360;
      const saturation = 70 + Math.floor(Math.random() * 20);
      const lightness = 40 + Math.floor(Math.random() * 30);
      newColors.push(hslToHex(hue, saturation, lightness));
    }

    setSavedColors(newColors);
    setCurrentColor(newColors[0]);
    const [h, s, l] = hexToHSL(newColors[0]);
    setHue(h);
    setSaturation(s);
    setLightness(l);

    // 업데이트 이벤트 기록
    addHistoryEntry("color-picker", "update");
  };

  // 색상 조화 유형
  const colorHarmonies = [
    {
      name: "Complementary",
      description: "서로 반대되는 색상으로 강한 대비를 만듭니다.",
      example: ["#6d28d9", "#28d96d"],
    },
    {
      name: "Analogous",
      description: "색상환에서 서로 인접한 색상들로 조화로운 느낌을 줍니다.",
      example: ["#6d28d9", "#9028d9", "#4928d9"],
    },
    {
      name: "Triadic",
      description:
        "색상환에서 균등하게 배치된 세 가지 색상으로 균형 잡힌 대비를 만듭니다.",
      example: ["#6d28d9", "#d96d28", "#28d96d"],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-pink-800 dark:text-pink-300">
          완벽한 색상 조합을 찾아보세요
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          직관적인 컬러 피커로 색상을 선택하고, 팔레트를 만들어 디자인 작업에
          활용하세요.
        </p>
      </div>

      <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 border-pink-200 dark:border-pink-800">
        <CardHeader className="bg-pink-50 dark:bg-pink-950/20 border-b border-pink-100 dark:border-pink-900">
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-pink-500" />
            <CardTitle>Color Picker</CardTitle>
          </div>
          <CardDescription>
            색상을 선택하고 팔레트를 만들어 저장하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="picker" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="picker">Color Picker</TabsTrigger>
              <TabsTrigger value="palette">Saved Palette</TabsTrigger>
              <TabsTrigger value="guide">Color Guide</TabsTrigger>
            </TabsList>
            <TabsContent value="picker" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Color</label>
                    <div
                      className="h-32 rounded-lg border"
                      style={{ backgroundColor: currentColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={currentColor}
                      onChange={handleColorChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={currentColor}
                      onChange={handleColorChange}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(currentColor)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={saveColor}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hue: {hue}°</label>
                    <Slider
                      value={[hue]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={(value) => {
                        setHue(value[0]);
                        updateHSL();
                      }}
                      className="[&_[role=slider]]:bg-[hsl(var(--hue),70%,50%)]"
                      style={{ "--hue": hue } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Saturation: {saturation}%
                    </label>
                    <Slider
                      value={[saturation]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        setSaturation(value[0]);
                        updateHSL();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Lightness: {lightness}%
                    </label>
                    <Slider
                      value={[lightness]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        setLightness(value[0]);
                        updateHSL();
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="palette" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {savedColors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="h-20 rounded-lg border cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setCurrentColor(color);
                        const [h, s, l] = hexToHSL(color);
                        setHue(h);
                        setSaturation(s);
                        setLightness(l);
                      }}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs flex-1 truncate">{color}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(color)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeColor(color)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={generatePalette}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Generate Random Palette
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="guide" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                  <Info className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">색상 이론 기초</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      색상 이론은 색상의 혼합, 조화, 대비에 관한 지식
                      체계입니다. 효과적인 디자인을 위해 색상 조화와 대비를
                      이해하는 것이 중요합니다.
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm font-medium">
                      색상 조화 유형
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {colorHarmonies.map((harmony, index) => (
                          <div key={index} className="space-y-2">
                            <h4 className="text-sm font-medium">
                              {harmony.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {harmony.description}
                            </p>
                            <div className="flex gap-2">
                              {harmony.example.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full border"
                                  style={{ backgroundColor: color }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm font-medium">
                      색상 선택 팁
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>브랜드 아이덴티티와 일치하는 색상을 선택하세요.</li>
                        <li>
                          대상 사용자와 문화적 맥락을 고려하세요 (색상은
                          문화마다 다른 의미를 가질 수 있습니다).
                        </li>
                        <li>
                          접근성을 위해 충분한 대비를 제공하는 색상을
                          선택하세요.
                        </li>
                        <li>
                          60-30-10 규칙을 고려하세요: 주 색상 60%, 보조 색상
                          30%, 강조 색상 10%.
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm font-medium">
                      색상 심리학
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          색상은 사용자의 감정과 행동에 영향을 미칠 수 있습니다:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            <span className="text-blue-500 font-medium">
                              파란색
                            </span>
                            : 신뢰, 안정, 평화
                          </li>
                          <li>
                            <span className="text-red-500 font-medium">
                              빨간색
                            </span>
                            : 열정, 긴급함, 에너지
                          </li>
                          <li>
                            <span className="text-green-500 font-medium">
                              초록색
                            </span>
                            : 성장, 건강, 조화
                          </li>
                          <li>
                            <span className="text-yellow-500 font-medium">
                              노란색
                            </span>
                            : 행복, 낙관, 창의성
                          </li>
                          <li>
                            <span className="text-purple-500 font-medium">
                              보라색
                            </span>
                            : 창의성, 지혜, 고급스러움
                          </li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              현재 색상: <span className="font-mono">{currentColor}</span>
            </div>
            <Button
              onClick={saveColor}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Save Current Color
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-pink-100 dark:border-pink-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="font-medium">색상 선택의 중요성</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            색상은 브랜드 아이덴티티와 사용자 경험에 큰 영향을 미칩니다. 적절한
            색상 선택은 사용자의 감정과 행동을 유도하는 데 도움이 됩니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-pink-100 dark:border-pink-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <Palette className="h-4 w-4 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="font-medium">팔레트 활용하기</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            색상 팔레트는 디자인의 일관성을 유지하는 데 중요합니다. 주 색상,
            보조 색상, 강조 색상을 포함한 팔레트를 만들어 디자인에 적용해보세요.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-pink-100 dark:border-pink-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="font-medium">알고 계셨나요?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            HSL(Hue, Saturation, Lightness) 색상 모델은 인간이 색상을 인식하는
            방식에 더 가깝습니다. 이는 색상 조정과 조화로운 팔레트 생성에
            유용합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
