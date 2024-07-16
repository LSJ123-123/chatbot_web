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
        title: "Error",
        description: error,
      })
    }
    if (message) {
      toast({
        title: "Success",
        description: message,
      })
    }
  }, [error, message, toast])

  return null
}

export default ToastHandler;