import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToolStateProvider } from "@/hooks/use-tool-state";
import { PomodoroProvider } from "@/components/tools/pomodoro/PomodoroContext";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
      <head>
        <meta name="referrer" content="no-referrer" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToolStateProvider>
            <PomodoroProvider>{children}</PomodoroProvider>
            <Analytics />
          </ToolStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
