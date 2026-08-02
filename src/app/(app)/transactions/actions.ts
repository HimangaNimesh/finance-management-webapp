'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const type = formData.get('type') as string
  const account_id = formData.get('account_id') as string
  const category_id = formData.get('category_id') as string || null
  const amount = parseFloat(formData.get('amount') as string)
  const transaction_date = formData.get('transaction_date') as string
  const note = formData.get('note') as string

  // Find active budget period if applicable (only for income/expense)
  let budget_period_id = null
  if (type !== 'transfer') {
    const { data: activePeriod } = await supabase
      .from('budget_periods')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .single()
    if (activePeriod) {
      budget_period_id = activePeriod.id
    }
  }

  const { error } = await supabase.from('transactions').insert({
    workspace_id: workspaceId,
    account_id,
    category_id,
    budget_period_id,
    type,
    amount,
    transaction_date,
    note,
    created_by: (await supabase.auth.getUser()).data.user?.id
  })

  if (error) {
    throw new Error('Failed to create transaction: ' + error.message)
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budget')
  revalidatePath('/accounts')
}

export async function deleteTransaction(transactionId: string) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw new Error('Failed to delete transaction: ' + error.message)
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budget')
  revalidatePath('/accounts')
}
