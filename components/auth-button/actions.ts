'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function logout() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  cookies().set('auth-state-changed', 'true', { maxAge: 1 }) // 1초 동안 유효

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
