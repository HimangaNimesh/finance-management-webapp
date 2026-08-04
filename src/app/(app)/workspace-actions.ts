'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function switchWorkspace(workspaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set('active_workspace_id', workspaceId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  // We revalidate the entire app layout to refresh everything with the new workspace context
  revalidatePath('/', 'layout')
  redirect('/')
}
