import Link from "next/link";
import {
  ArrowRight,
  Code,
  Palette,
  Calculator,
  Clock,
  FileText,
  Zap,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const tools = [
    {
      id: "code-formatter",
      name: "Code Formatter",
      description: "포맷팅 옵션을 선택하고 코드를 정리해주는 도구",
      icon: <Code className="h-8 w-8 text-violet-500" />,
      color: "bg-violet-50 dark:bg-violet-950/20",
      borderColor: "border-violet-200 dark:border-violet-800",
    },
    {
      id: "color-picker",
      name: "Color Picker",
      description: "색상 팔레트를 생성하고 관리하는 도구",
      icon: <Palette className="h-8 w-8 text-pink-500" />,
      color: "bg-pink-50 dark:bg-pink-950/20",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      id: "calculator",
      name: "Calculator",
      description: "다양한 계산 기능을 제공하는 계산기",
      icon: <Calculator className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      id: "pomodoro",
      name: "Pomodoro Timer",
      description: "집중력 향상을 위한 포모도로 타이머",
      icon: <Clock className="h-8 w-8 text-red-500" />,
      color: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      id: "markdown",
      name: "Markdown Editor",
      description: "마크다운 문서를 작성하고 미리보기하는 도구",
      icon: <FileText className="h-8 w-8 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      id: "unit-converter",
      name: "Unit Converter",
      description: "다양한 단위를 변환해주는 도구",
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      id: "random-picker",
      name: "Random Picker",
      description: "룰렛 효과와 함께 랜덤하게 항목을 선택하는 도구",
      icon: <Shuffle className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-screen-2xl mx-auto flex h-16 items-center">
          <div className="mr-4 flex">
            <Link
              href="/"
              className="flex items-center space-x-2 pl-2 sm:pl-3 md:pl-4"
            >
              <span className="text-xl font-bold">ToolHub</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <div className="container max-w-screen-2xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  유용한 웹 도구를 한 곳에서
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  필요한 웹 도구를 한 곳에서 편리하게 사용하세요. 각 도구는
                  독립적으로 작동하며 언제든지 메인 페이지로 돌아올 수 있습니다.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg">도구 둘러보기</Button>
                <Button variant="outline" size="lg">
                  더 알아보기
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-screen-2xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  사용 가능한 도구
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  다양한 웹 도구를 탐색하고 필요에 맞게 사용해보세요.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`https://${tool.id}.toolhub.services`}
                  className="group"
                >
                  <Card
                    className={`h-full overflow-hidden transition-all hover:shadow-lg ${tool.borderColor}`}
                  >
                    <CardHeader className={`${tool.color}`}>
                      <div className="flex items-center gap-4">
                        {tool.icon}
                        <CardTitle>{tool.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <div className="flex items-center text-sm font-medium text-primary">
                        도구 사용하기
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container max-w-screen-2xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  왜 ToolHub인가요?
                </h2>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  ToolHub는 다양한 웹 도구를 한 곳에서 제공하여 작업 효율성을
                  높이고 시간을 절약해줍니다. 각 도구는 독립적으로 작동하면서도
                  일관된 사용자 경험을 제공합니다.
                </p>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                    서버 없이 브라우저에서 동작하는 가벼운 도구
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                    각 도구마다 특화된 디자인과 기능
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                    언제든지 메인 페이지로 돌아올 수 있는 편리한 네비게이션
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                    모든 기기에서 반응형으로 작동
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[400px] w-[400px] rounded-full bg-gradient-to-r from-primary to-primary-foreground/20 p-1">
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background p-4">
                    <div className="space-y-2 text-center">
                      <h3 className="text-2xl font-bold">
                        모든 도구를 한 곳에서
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        필요한 모든 웹 도구를 한 번의 클릭으로 사용하세요
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container max-w-screen-2xl mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ToolHub. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-gray-500 hover:underline dark:text-gray-400"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 hover:underline dark:text-gray-400"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 hover:underline dark:text-gray-400"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
