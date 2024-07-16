// ToastHandler.tsx
'use client'

import { useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"

const ToastHandler = ({ error, message }: { error?: string, message?: string }) => {
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: error,
      })
    }
    if (message) {
      toast({
        title: "성공",
        description: message,
      })
    }
  }, [error, message, toast])

  return null
}

export default ToastHandler;