'use client'

import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'

const OAuthButton = ({ provider, children }: { provider: 'google' | 'kakao', children: React.ReactNode }) => {
  const supabase = createClient()

  const handleOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('OAuth error:', error)
    }
  }

  return (
    <Button onClick={handleOAuth} className="w-full h-10" variant="secondary">
      {children}
    </Button>
  )
}

export default OAuthButton;