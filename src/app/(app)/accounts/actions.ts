'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function addAccount(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const bank_name = (formData.get('bank_name') as string) || null
  const starting_balance = parseFloat(formData.get('starting_balance') as string)

  const { error } = await supabase.from('accounts').insert({
    workspace_id: workspaceId,
    name,
    type,
    bank_name,
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

export async function editAccount(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const bank_name = (formData.get('bank_name') as string) || null
  const new_starting_balance = parseFloat(formData.get('starting_balance') as string)

  // Fetch the old account to calculate balance difference
  const { data: oldAccount, error: fetchError } = await supabase
    .from('accounts')
    .select('starting_balance, current_balance')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (fetchError || !oldAccount) {
    throw new Error('Account not found')
  }

  const diff = new_starting_balance - oldAccount.starting_balance
  const new_current_balance = oldAccount.current_balance + diff

  const { error } = await supabase
    .from('accounts')
    .update({
      name,
      type,
      bank_name,
      starting_balance: new_starting_balance,
      current_balance: new_current_balance,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw new Error('Failed to update account: ' + error.message)
  }

  revalidatePath('/accounts')
}
