'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function addAccount(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const starting_balance = parseFloat(formData.get('starting_balance') as string)

  const { error } = await supabase.from('accounts').insert({
    workspace_id: workspaceId,
    name,
    type,
    starting_balance,
    current_balance: starting_balance,
  })

  if (error) {
    throw new Error('Failed to create account: ' + error.message)
  }

  revalidatePath('/accounts')
}

export async function deleteAccount(accountId: string) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('workspace_id', workspaceId) // Extra safety

  if (error) {
    throw new Error('Failed to delete account: ' + error.message)
  }

  revalidatePath('/accounts')
}
