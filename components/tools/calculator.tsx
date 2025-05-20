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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalculatorIcon,
  Percent,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
  Delete,
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

// 계산기 상태 타입 정의
interface CalculatorState {
  display: string;
  memory: string;
  operator: string;
  waitingForOperand: boolean;
  history: string[];
}

// 기본 상태 값
const defaultCalculatorState: CalculatorState = {
  display: "0",
  memory: "",
  operator: "",
  waitingForOperand: false,
  history: [],
};

export default function Calculator() {
  // useToolState 훅 사용
  const { getToolState, updateToolState, addHistoryEntry } = useToolState();

  // 도구 상태 가져오기
  const toolState = getToolState<CalculatorState>("calculator");
  const state = toolState?.data || defaultCalculatorState;

  // 로컬 상태 (컨텍스트에서 관리할 상태)
  const [display, setDisplay] = useState<string>(state.display);
  const [memory, setMemory] = useState<string>(state.memory);
  const [operator, setOperator] = useState<string>(state.operator);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(
    state.waitingForOperand
  );
  const [history, setHistory] = useState<string[]>(state.history);
  const [isClient, setIsClient] = useState<boolean>(false);

  // 상태 업데이트 함수 - 상태 변경을 Context에 저장
  const updateCalculatorState = () => {
    // 현재 상태를 Context에 저장
    updateToolState<CalculatorState>("calculator", {
      display,
      memory,
      operator,
      waitingForOperand,
      history,
    });
  };

  useEffect(() => {
    // 클라이언트 사이드 체크
    setIsClient(true);

    // 도구 열림 이벤트 기록
    addHistoryEntry("calculator", "open");

    // 컴포넌트 언마운트 시 도구 닫힘 이벤트 기록
    return () => {
      addHistoryEntry("calculator", "close");
    };
  }, []);

  // 상태가 변경될 때마다 Context 업데이트
  useEffect(() => {
    if (isClient) {
      updateCalculatorState();
    }
  }, [display, memory, operator, waitingForOperand, history, isClient]);

  const clearDisplay = () => {
    setDisplay("0");
    setWaitingForOperand(false);

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const clearAll = () => {
    setDisplay("0");
    setMemory("");
    setOperator("");
    setWaitingForOperand(false);

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const inputPercent = () => {
    const value = Number.parseFloat(display) / 100;
    setDisplay(value.toString());

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const toggleSign = () => {
    const value = Number.parseFloat(display) * -1;
    setDisplay(value.toString());

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = Number.parseFloat(display);

    if (memory === "") {
      setMemory(display);
    } else if (operator) {
      const currentValue = Number.parseFloat(memory);
      let newValue = 0;

      switch (operator) {
        case "+":
          newValue = currentValue + inputValue;
          break;
        case "-":
          newValue = currentValue - inputValue;
          break;
        case "×":
          newValue = currentValue * inputValue;
          break;
        case "÷":
          newValue = currentValue / inputValue;
          break;
        default:
          newValue = inputValue;
      }

      setMemory(newValue.toString());
      setDisplay(newValue.toString());

      // 계산 기록 추가
      setHistory([
        ...history,
        `${currentValue} ${operator} ${inputValue} = ${newValue}`,
      ]);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);

    // 업데이트 이벤트 기록
    addHistoryEntry("calculator", "update");
  };

  const handleKeypad = (value: string) => {
    switch (value) {
      case "C":
        clearAll();
        break;
      case "CE":
        clearDisplay();
        break;
      case "±":
        toggleSign();
        break;
      case "%":
        inputPercent();
        break;
      case ".":
        inputDecimal();
        break;
      case "=":
        performOperation("=");
        break;
      case "+":
      case "-":
      case "×":
      case "÷":
        performOperation(value);
        break;
      default:
        inputDigit(value);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">
          간편하고 직관적인 계산기
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          기본 계산 기능과 계산 기록을 제공하는 사용하기 쉬운 계산기입니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-medium">계산기 사용법</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>이 계산기는 기본적인 산술 연산을 지원합니다:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>숫자 버튼을 눌러 숫자를 입력하세요</li>
                <li>연산자 버튼(+, -, ×, ÷)을 눌러 연산을 선택하세요</li>
                <li>= 버튼을 눌러 결과를 확인하세요</li>
                <li>C 버튼은 모든 입력을 지우고, CE는 현재 입력만 지웁니다</li>
                <li>% 버튼은 현재 값을 100으로 나눕니다</li>
                <li>± 버튼은 부호를 바꿉니다</li>
              </ul>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm"
          >
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="px-5 py-3">계산 팁</AccordionTrigger>
              <AccordionContent className="px-5 pb-3">
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p>복잡한 계산은 괄호를 사용하여 순서를 명확히 하세요.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p>퍼센트 계산 시 % 버튼을 활용하면 편리합니다.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p>History 탭에서 이전 계산 결과를 확인할 수 있습니다.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="md:w-2/3">
          <Card className="w-full bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2">
                <CalculatorIcon className="h-6 w-6 text-blue-500" />
                <CardTitle>Calculator</CardTitle>
              </div>
              <CardDescription>
                기본 계산기와 계산 기록을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="calculator" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="calculator">Calculator</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="calculator" className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-right">
                    <div className="text-gray-500 dark:text-gray-400 text-sm h-6">
                      {memory && `${memory} ${operator}`}
                    </div>
                    <div className="text-3xl font-medium truncate">
                      {display}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      className="h-12 text-gray-500"
                      onClick={() => handleKeypad("C")}
                    >
                      C
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-gray-500"
                      onClick={() => handleKeypad("CE")}
                    >
                      CE
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-gray-500"
                      onClick={() => handleKeypad("%")}
                    >
                      <Percent className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-blue-500"
                      onClick={() => handleKeypad("÷")}
                    >
                      <Divide className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("7")}
                    >
                      7
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("8")}
                    >
                      8
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("9")}
                    >
                      9
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-blue-500"
                      onClick={() => handleKeypad("×")}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("4")}
                    >
                      4
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("5")}
                    >
                      5
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("6")}
                    >
                      6
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-blue-500"
                      onClick={() => handleKeypad("-")}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("1")}
                    >
                      1
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("2")}
                    >
                      2
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("3")}
                    >
                      3
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-blue-500"
                      onClick={() => handleKeypad("+")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("±")}
                    >
                      ±
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad("0")}
                    >
                      0
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => handleKeypad(".")}
                    >
                      .
                    </Button>
                    <Button
                      className="h-12 bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleKeypad("=")}
                    >
                      <Equal className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent
                  value="history"
                  className="h-[400px] overflow-y-auto"
                >
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      계산 기록이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-right"
                        >
                          {item}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setHistory([])}
                      >
                        <Delete className="h-4 w-4 mr-2" />
                        기록 지우기
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-medium">계산기 기능</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            이 계산기는 기본적인 산술 연산(+, -, ×, ÷)과 함께 퍼센트 계산, 부호
            변경 등의 기능을 제공합니다. 계산 기록도 저장되어 이전 계산을 확인할
            수 있습니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <CalculatorIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-medium">계산 원리</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            계산기는 입력된 숫자와 연산자를 순차적으로 처리하여 결과를
            도출합니다. 복잡한 계산도 단계별로 나누어 처리하면 쉽게 해결할 수
            있습니다.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-medium">알고 계셨나요?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            최초의 기계식 계산기는 1642년 블레즈 파스칼에 의해 발명되었습니다.
            오늘날의 디지털 계산기는 복잡한 연산도 순식간에 처리할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
