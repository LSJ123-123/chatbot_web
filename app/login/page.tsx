// LoginPage.tsx
import { login, signup } from './actions'
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import OAuthButton from '@/components/oauth-button'
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import ToastHandler from '@/components/toast-handler'  // 새로 만들 클라이언트 컴포넌트

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const error = searchParams.error as string | undefined
  const message = searchParams.message as string | undefined

  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center bg-zinc-900">
      <Card className="w-full max-w-md p-6 bg-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">로그인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div>
              <Label htmlFor="email">Email:</Label>
              <Input id="email" name="email" type="email" required placeholder='Email' className='text-zinc-800' />
            </div>
            <div>
              <Label htmlFor="password">Password:</Label>
              <Input id="password" name="password" type="password" required placeholder='Password' className='text-zinc-800' />
            </div>
            <div className="flex space-x-2">
              <Button formAction={login} className="w-full h-10" variant="secondary">로그인</Button>
              <Button formAction={signup} className="w-full h-10" variant="secondary">회원가입</Button>
            </div>
          </form>

          <Separator className="my-4" />

          <div className="space-y-4">
            <OAuthButton provider="google">구글로 계속하기</OAuthButton>
            <OAuthButton provider="kakao">카카오톡으로 계속하기</OAuthButton>
          </div>
        </CardContent>
      </Card>
      <Toaster />
      <ToastHandler error={error} message={message} />
    </div>
  )
}