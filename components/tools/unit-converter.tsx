"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  ArrowRightLeft,
  Trash2,
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
import { useToolState } from "@/hooks/use-tool-state";

type ConversionType =
  | "length"
  | "weight"
  | "temperature"
  | "time"
  | "area"
  | "volume";
type ConversionHistory = {
  type: ConversionType;
  from: string;
  to: string;
  inputValue: number;
  outputValue: number;
  timestamp: Date;
};

// 단위 변환기 상태 타입 정의
interface UnitConverterState {
  conversionType: ConversionType;
  fromUnit: string;
  toUnit: string;
  inputValue: string;
  outputValue: string;
  history: ConversionHistory[];
}

// 기본 상태 값
const defaultUnitConverterState: UnitConverterState = {
  conversionType: "length",
  fromUnit: "m",
  toUnit: "km",
  inputValue: "1",
  outputValue: "0.001",
  history: [],
};

export default function UnitConverter() {
  // useToolState 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();

  // 도구 상태 가져오기
  const toolState = getToolState<UnitConverterState>("converter");
  const state = toolState?.data || defaultUnitConverterState;

  // 로컬 상태 (컨텍스트에서 관리할 상태)
  const [conversionType, setConversionType] = useState<ConversionType>(
    state.conversionType
  );
  const [fromUnit, setFromUnit] = useState<string>(state.fromUnit);
  const [toUnit, setToUnit] = useState<string>(state.toUnit);
  const [inputValue, setInputValue] = useState<string>(state.inputValue);
  const [outputValue, setOutputValue] = useState<string>(state.outputValue);
  const [history, setHistory] = useState<ConversionHistory[]>(state.history);
  const [isClient, setIsClient] = useState<boolean>(false);

  // 상태 업데이트 함수 - 상태 변경을 Context에 저장
  const updateUnitConverterState = () => {
    // 현재 상태를 Context에 저장
    updateToolState<UnitConverterState>("converter", {
      conversionType,
      fromUnit,
      toUnit,
      inputValue,
      outputValue,
      history,
    });
  };

  useEffect(() => {
    // 클라이언트 사이드 체크
    setIsClient(true);

    // 도구 열림 이벤트 기록
    addHistoryEntry("converter", "open");

    // 컴포넌트 언마운트 시 도구 닫힘 이벤트 기록
    return () => {
      addHistoryEntry("converter", "close");
    };
  }, []);

  // 상태가 변경될 때마다 Context 업데이트
  useEffect(() => {
    if (isClient) {
      updateUnitConverterState();
    }
  }, [
    conversionType,
    fromUnit,
    toUnit,
    inputValue,
    outputValue,
    history,
    isClient,
  ]);

  const conversionUnits = {
    length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
    weight: ["mg", "g", "kg", "t", "oz", "lb"],
    temperature: ["C", "F", "K"],
    time: ["ms", "s", "min", "h", "day", "week", "month", "year"],
    area: ["mm²", "cm²", "m²", "km²", "in²", "ft²", "acre", "ha"],
    volume: ["ml", "l", "m³", "gal", "pt", "qt"],
  };

  const unitLabels = {
    mm: "밀리미터 (mm)",
    cm: "센티미터 (cm)",
    m: "미터 (m)",
    km: "킬로미터 (km)",
    in: "인치 (in)",
    ft: "피트 (ft)",
    yd: "야드 (yd)",
    mi: "마일 (mi)",
    mg: "밀리그램 (mg)",
    g: "그램 (g)",
    kg: "킬로그램 (kg)",
    t: "톤 (t)",
    oz: "온스 (oz)",
    lb: "파운드 (lb)",
    C: "섭씨 (°C)",
    F: "화씨 (°F)",
    K: "켈빈 (K)",
    ms: "밀리초 (ms)",
    s: "초 (s)",
    min: "분 (min)",
    h: "시간 (h)",
    day: "일 (day)",
    week: "주 (week)",
    month: "월 (month)",
    year: "년 (year)",
    "mm²": "제곱밀리미터 (mm²)",
    "cm²": "제곱센티미터 (cm²)",
    "m²": "제곱미터 (m²)",
    "km²": "제곱킬로미터 (km²)",
    "in²": "제곱인치 (in²)",
    "ft²": "제곱피트 (ft²)",
    acre: "에이커 (acre)",
    ha: "헥타르 (ha)",
    ml: "밀리리터 (ml)",
    l: "리터 (l)",
    "m³": "세제곱미터 (m³)",
    gal: "갤런 (gal)",
    pt: "파인트 (pt)",
    qt: "쿼트 (qt)",
  } as const;

  const conversionFactors: Record<string, Record<string, number>> = {
    // 길이 변환 (미터 기준)
    mm: {
      mm: 1,
      cm: 0.1,
      m: 0.001,
      km: 0.000001,
      in: 0.03937,
      ft: 0.003281,
      yd: 0.001094,
      mi: 0.0000006214,
    },
    cm: {
      mm: 10,
      cm: 1,
      m: 0.01,
      km: 0.00001,
      in: 0.3937,
      ft: 0.03281,
      yd: 0.01094,
      mi: 0.000006214,
    },
    m: {
      mm: 1000,
      cm: 100,
      m: 1,
      km: 0.001,
      in: 39.37,
      ft: 3.281,
      yd: 1.094,
      mi: 0.0006214,
    },
    km: {
      mm: 1000000,
      cm: 100000,
      m: 1000,
      km: 1,
      in: 39370,
      ft: 3281,
      yd: 1094,
      mi: 0.6214,
    },
    in: {
      mm: 25.4,
      cm: 2.54,
      m: 0.0254,
      km: 0.0000254,
      in: 1,
      ft: 0.08333,
      yd: 0.02778,
      mi: 0.00001578,
    },
    ft: {
      mm: 304.8,
      cm: 30.48,
      m: 0.3048,
      km: 0.0003048,
      in: 12,
      ft: 1,
      yd: 0.3333,
      mi: 0.0001894,
    },
    yd: {
      mm: 914.4,
      cm: 91.44,
      m: 0.9144,
      km: 0.0009144,
      in: 36,
      ft: 3,
      yd: 1,
      mi: 0.0005682,
    },
    mi: {
      mm: 1609344,
      cm: 160934.4,
      m: 1609.344,
      km: 1.609344,
      in: 63360,
      ft: 5280,
      yd: 1760,
      mi: 1,
    },

    // 무게 변환 (그램 기준)
    mg: {
      mg: 1,
      g: 0.001,
      kg: 0.000001,
      t: 0.000000001,
      oz: 0.00003527,
      lb: 0.000002205,
    },
    g: { mg: 1000, g: 1, kg: 0.001, t: 0.000001, oz: 0.03527, lb: 0.002205 },
    kg: { mg: 1000000, g: 1000, kg: 1, t: 0.001, oz: 35.27, lb: 2.205 },
    t: { mg: 1000000000, g: 1000000, kg: 1000, t: 1, oz: 35270, lb: 2205 },
    oz: {
      mg: 28349.5,
      g: 28.3495,
      kg: 0.0283495,
      t: 0.0000283495,
      oz: 1,
      lb: 0.0625,
    },
    lb: { mg: 453592, g: 453.592, kg: 0.453592, t: 0.000453592, oz: 16, lb: 1 },
  };

  const convert = () => {
    const input = Number.parseFloat(inputValue);
    if (isNaN(input)) {
      setOutputValue("Invalid input");
      return;
    }

    let result: number;

    // 온도 변환 (특수 케이스)
    if (conversionType === "temperature") {
      if (fromUnit === "C" && toUnit === "F") {
        result = (input * 9) / 5 + 32;
      } else if (fromUnit === "C" && toUnit === "K") {
        result = input + 273.15;
      } else if (fromUnit === "F" && toUnit === "C") {
        result = ((input - 32) * 5) / 9;
      } else if (fromUnit === "F" && toUnit === "K") {
        result = ((input - 32) * 5) / 9 + 273.15;
      } else if (fromUnit === "K" && toUnit === "C") {
        result = input - 273.15;
      } else if (fromUnit === "K" && toUnit === "F") {
        result = ((input - 273.15) * 9) / 5 + 32;
      } else {
        result = input; // 같은 단위
      }
    } else {
      // 일반 변환
      result = input * (conversionFactors[fromUnit]?.[toUnit] || 0);
    }

    // 결과 반올림 (소수점 6자리까지)
    const roundedResult = Math.round(result * 1000000) / 1000000;
    setOutputValue(roundedResult.toString());

    // 변환 기록 저장
    setHistory(
      [
        {
          type: conversionType,
          from: fromUnit,
          to: toUnit,
          inputValue: input,
          outputValue: roundedResult,
          timestamp: new Date(),
        },
        ...history,
      ].slice(0, 10)
    ); // 최근 10개만 유지

    // 업데이트 이벤트 기록
    addHistoryEntry("converter", "update");
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(outputValue);
    convert();

    // 업데이트 이벤트 기록
    addHistoryEntry("converter", "update");
  };

  const clearHistory = () => {
    setHistory([]);

    // 업데이트 이벤트 기록
    addHistoryEntry("converter", "update");
  };

  const handleConversionTypeChange = (value: string) => {
    const newType = value as ConversionType;
    setConversionType(newType);
    setFromUnit(conversionUnits[newType][0]);
    setToUnit(conversionUnits[newType][1]);
    setInputValue("1");
    setOutputValue("");

    // 업데이트 이벤트 기록
    addHistoryEntry("converter", "update");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  // 단위 변환 팁
  const conversionTips = [
    {
      type: "length",
      tip: "1 인치는 2.54 센티미터입니다. 미터법과 영국식 단위 간 변환 시 유용합니다.",
    },
    {
      type: "weight",
      tip: "1 파운드는 약 0.454 킬로그램입니다. 요리 레시피 변환 시 자주 사용됩니다.",
    },
    {
      type: "temperature",
      tip: "화씨 온도를 섭씨로 변환: (°F - 32) × 5/9 = °C",
    },
    {
      type: "area",
      tip: "1 제곱미터는 약 10.764 제곱피트입니다. 부동산 면적 계산 시 유용합니다.",
    },
    {
      type: "volume",
      tip: "1 갤런은 약 3.785 리터입니다. 연료 효율성 계산 시 유용합니다.",
    },
  ];

  // 현재 선택된 변환 유형에 맞는 팁 찾기
  const currentTip = conversionTips.find((tip) => tip.type === conversionType);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300">
          다양한 단위를 쉽게 변환하세요
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          길이, 무게, 온도 등 다양한 단위를 간편하게 변환할 수 있는 도구입니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="md:w-2/3">
          <Card className="w-full bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-500" />
                <CardTitle>Unit Converter</CardTitle>
              </div>
              <CardDescription>
                다양한 단위를 쉽게 변환해보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="converter" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="converter">Converter</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="guide">Guide</TabsTrigger>
                </TabsList>
                <TabsContent value="converter" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="conversion-type">변환 유형</Label>
                      <Select
                        value={conversionType}
                        onValueChange={handleConversionTypeChange}
                      >
                        <SelectTrigger id="conversion-type">
                          <SelectValue placeholder="변환 유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="length">길이</SelectItem>
                          <SelectItem value="weight">무게</SelectItem>
                          <SelectItem value="temperature">온도</SelectItem>
                          <SelectItem value="time">시간</SelectItem>
                          <SelectItem value="area">면적</SelectItem>
                          <SelectItem value="volume">부피</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="from-unit">From</Label>
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger id="from-unit">
                            <SelectValue placeholder="단위 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {conversionUnits[conversionType].map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unitLabels[unit as keyof typeof unitLabels]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={swapUnits}
                        className="mb-0.5"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>

                      <div className="space-y-2">
                        <Label htmlFor="to-unit">To</Label>
                        <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger id="to-unit">
                            <SelectValue placeholder="단위 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {conversionUnits[conversionType].map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unitLabels[unit as keyof typeof unitLabels]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="input-value">값 입력</Label>
                      <Input
                        id="input-value"
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            convert();
                          }
                        }}
                      />
                    </div>

                    <Button
                      onClick={convert}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      변환하기
                    </Button>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        결과
                      </div>
                      <div className="text-xl font-semibold">
                        {outputValue ? (
                          <>
                            {inputValue}{" "}
                            {unitLabels[fromUnit as keyof typeof unitLabels]} ={" "}
                            {outputValue}{" "}
                            {unitLabels[toUnit as keyof typeof unitLabels]}
                          </>
                        ) : (
                          "변환 버튼을 클릭하세요"
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent
                  value="history"
                  className="h-[400px] overflow-y-auto"
                >
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      변환 기록이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {item.type.charAt(0).toUpperCase() +
                                item.type.slice(1)}{" "}
                              변환
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(item.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm">
                            {item.inputValue}{" "}
                            {unitLabels[item.from as keyof typeof unitLabels]} ={" "}
                            {item.outputValue}{" "}
                            {unitLabels[item.to as keyof typeof unitLabels]}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={clearHistory}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        기록 지우기
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="guide" className="space-y-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="usage">
                      <AccordionTrigger>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        사용 방법
                      </AccordionTrigger>
                      <AccordionContent>
                        변환하려는 값과 단위를 선택하고 "변환하기" 버튼을
                        클릭하세요. 변환 기록은 History 탭에서 확인할 수
                        있습니다.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="tips">
                      <AccordionTrigger>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        변환 팁
                      </AccordionTrigger>
                      <AccordionContent>
                        {currentTip ? (
                          <>
                            <p>{currentTip.tip}</p>
                          </>
                        ) : (
                          <p>각 단위 유형에 대한 팁을 확인하세요.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="about">
                      <AccordionTrigger>
                        <Info className="mr-2 h-4 w-4" />
                        단위 변환기 정보
                      </AccordionTrigger>
                      <AccordionContent>
                        이 도구는 다양한 단위 간의 변환을 지원합니다. 정확한
                        변환을 위해 최신 데이터를 사용하고 있습니다.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              자주 묻는 질문
            </h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="q1">
                <AccordionTrigger>어떻게 사용하나요?</AccordionTrigger>
                <AccordionContent>
                  변환하려는 값과 단위를 선택하고 "변환하기" 버튼을 클릭하면
                  됩니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>지원하는 단위는 무엇인가요?</AccordionTrigger>
                <AccordionContent>
                  길이, 무게, 온도, 시간, 면적, 부피 단위를 지원합니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>
                  변환 기록은 어디에서 확인하나요?
                </AccordionTrigger>
                <AccordionContent>
                  History 탭에서 확인할 수 있습니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
