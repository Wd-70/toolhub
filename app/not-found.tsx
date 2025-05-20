import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-medium mt-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Link href="/" className="mt-8">
        <Button>메인 페이지로 돌아가기</Button>
      </Link>
    </div>
  )
}
