'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function inviteMember(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.rpc('invite_user_by_email', {
    invite_email: email,
    ws_id: workspaceId
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/settings')
}

export async function removeMember(userId: string) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('role', 'member') // prevent removing owner this way

  if (error) {
    throw new Error('Failed to remove member: ' + error.message)
  }

  revalidatePath('/settings')
}

export async function updateCurrency(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const currency = formData.get('currency') as string

  const { error } = await supabase
    .from('workspaces')
    .update({ currency })
    .eq('id', workspaceId)

  if (error) {
    throw new Error('Failed to update currency: ' + error.message)
  }

  revalidatePath('/', 'layout')
}
