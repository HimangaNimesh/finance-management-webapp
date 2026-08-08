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
    return { error: error.message }
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

export async function updateProfileName(formData: FormData) {
  const supabase = await createClient()
  const full_name = formData.get('full_name') as string

  const { error } = await supabase.auth.updateUser({
    data: { full_name }
  })

  if (error) {
    throw new Error('Failed to update name: ' + error.message)
  }

  revalidatePath('/settings')
}

export async function renameWorkspace(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const name = formData.get('name') as string

  const { error } = await supabase
    .from('workspaces')
    .update({ name })
    .eq('id', workspaceId)

  if (error) {
    throw new Error('Failed to rename workspace: ' + error.message)
  }

  revalidatePath('/', 'layout')
}

export async function updateTransferFee(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const fee = formData.get('transfer_fee_amount') as string
  const transfer_fee_amount = fee ? parseFloat(fee) : 0

  const { error } = await supabase
    .from('workspaces')
    .update({ transfer_fee_amount })
    .eq('id', workspaceId)

  if (error) {
    throw new Error('Failed to update transfer fee: ' + error.message)
  }

  revalidatePath('/settings')
}

export async function updateAtmFee(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const fee = formData.get('atm_fee_amount') as string
  const atm_fee_amount = fee ? parseFloat(fee) : 0

  const { error } = await supabase
    .from('workspaces')
    .update({ atm_fee_amount })
    .eq('id', workspaceId)

  if (error) {
    throw new Error('Failed to update ATM fee: ' + error.message)
  }

  revalidatePath('/settings')
}
