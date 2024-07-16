'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { User } from '@supabase/supabase-js'

export default function CompleteProfile() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                if (user.user_metadata.full_name && user.user_metadata.name) {
                    router.push('/')
                } else {
                    setUser(user)
                }
            } else {
                router.push('/login')
            }
            setIsLoading(false)
        }
        getUser()
    }, [])

    useEffect(() => {
        const error = new URLSearchParams(window.location.search).get('error')
        if (error) {
            toast({
                variant: "destructive",
                title: "오류",
                description: decodeURIComponent(error),
            })
        }
    }, [])

    async function handleSubmit(event : any) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.target)
        const name = formData.get('name') as string

        const { error } = await supabase.auth.updateUser({
            data: { name: name, full_name: name },
        })

        if (error) {
            toast({
                variant: "destructive",
                title: "오류",
                description: error.message,
            })
            setIsLoading(false)
        } else {
            toast({
                title: "성공",
                description: "프로필이 업데이트되었습니다.",
            })
            
            document.cookie = 'auth-state-changed=true;max-age=1'
            
            window.location.href = '/'
        }
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>프로필을 완성해주세요!</CardTitle>
                    <CardDescription>진행하려면 이름을 입력해주세요.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="이름을 입력해주세요"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? '저장 중...' : '저장'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <Toaster />
        </div>
    )
}