'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const message = searchParams.message as string | undefined
  const redirect = searchParams.redirect as string | undefined
  const router = useRouter()

  const handleGoBack = () => {
    if (redirect) {
      router.push(redirect)
    } else {
      router.back()
    }
  }

  if (!message) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>알 수 없는 오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">오류 정보가 제공되지 않았습니다.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGoBack} className="w-full">돌아가기</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-red-500">오류가 발생했습니다</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{message}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleGoBack} className="w-full">돌아가기</Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">홈으로 가기</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}