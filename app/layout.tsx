import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToolStateProvider } from "@/hooks/use-tool-state";
import { PomodoroProvider } from "@/components/tools/pomodoro/PomodoroContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ToolHub - 웹 도구 모음",
  description: "다양한 웹 도구를 한 곳에서 편리하게 사용하세요.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToolStateProvider>
            <PomodoroProvider>{children}</PomodoroProvider>
          </ToolStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
