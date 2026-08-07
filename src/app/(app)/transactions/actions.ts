'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const { workspaceId, transferFeeAmount } = await getActiveWorkspace()
  const supabase = await createClient()

  const type = formData.get('type') as string
  const account_id = formData.get('account_id') as string
  const to_account_id = formData.get('to_account_id') as string || null
  const category_id = formData.get('category_id') as string || null
  const amount = parseFloat(formData.get('amount') as string)
  const transaction_date = formData.get('transaction_date') as string
  const note = formData.get('note') as string

  // Find active budget period if applicable (only for income/expense)
  let budget_period_id = null
  if (type !== 'transfer') {
    const { data: matchingPeriod } = await supabase
      .from('budget_periods')
      .select('id')
      .eq('workspace_id', workspaceId)
      .lte('start_date', transaction_date)
      .gte('end_date', transaction_date)
      .limit(1)
      .maybeSingle()
    if (matchingPeriod) {
      budget_period_id = matchingPeriod.id
    }
  }

  const { data: tx, error } = await supabase.from('transactions').insert({
    workspace_id: workspaceId,
    account_id,
    to_account_id,
    category_id,
    budget_period_id,
    type,
    amount,
    transaction_date,
    note,
    created_by: (await supabase.auth.getUser()).data.user?.id
  }).select('id').single()

  if (error) {
    throw new Error('Failed to create transaction: ' + error.message)
  }

  // Handle transfer fee logic
  if (type === 'transfer' && to_account_id && transferFeeAmount > 0) {
    // Get account names to check exemption rule
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, name')
      .in('id', [account_id, to_account_id])
    
    const fromAccount = accounts?.find(a => a.id === account_id)?.name
    const toAccount = accounts?.find(a => a.id === to_account_id)?.name

    const isExempt = fromAccount === 'HNB Main' && toAccount === 'HNB debit card'

    if (!isExempt) {
      const { error: feeError } = await supabase.from('transactions').insert({
        workspace_id: workspaceId,
        account_id,
        type: 'expense',
        amount: transferFeeAmount,
        transaction_date,
        note: 'Bank Transfer Fee',
        linked_transaction_id: tx.id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      if (feeError) {
        console.error('Failed to create transfer fee:', feeError)
      }
    }
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

export async function editTransaction(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const id = formData.get('id') as string
  const type = formData.get('type') as string
  const account_id = formData.get('account_id') as string
  const to_account_id = formData.get('to_account_id') as string || null
  const category_id = formData.get('category_id') as string || null
  const amount = parseFloat(formData.get('amount') as string)
  const transaction_date = formData.get('transaction_date') as string
  const note = formData.get('note') as string

  // Fetch active budget period if applicable
  let budget_period_id = null
  if (type !== 'transfer') {
    const { data: matchingPeriod } = await supabase
      .from('budget_periods')
      .select('id')
      .eq('workspace_id', workspaceId)
      .lte('start_date', transaction_date)
      .gte('end_date', transaction_date)
      .limit(1)
      .maybeSingle()
    if (matchingPeriod) {
      budget_period_id = matchingPeriod.id
    }
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      account_id,
      to_account_id,
      category_id,
      budget_period_id,
      type,
      amount,
      transaction_date,
      note,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw new Error('Failed to update transaction: ' + error.message)
  }

  // Handle transfer fee logic for edits
  const { transferFeeAmount } = await getActiveWorkspace()
  if (type === 'transfer' && to_account_id) {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, name')
      .in('id', [account_id, to_account_id])
    
    const fromAccount = accounts?.find(a => a.id === account_id)?.name
    const toAccount = accounts?.find(a => a.id === to_account_id)?.name
    const isExempt = fromAccount === 'HNB Main' && toAccount === 'HNB debit card'

    // Check if a linked fee transaction already exists
    const { data: existingFee } = await supabase
      .from('transactions')
      .select('id')
      .eq('linked_transaction_id', id)
      .maybeSingle()

    if (isExempt || transferFeeAmount <= 0) {
      if (existingFee) {
        await supabase.from('transactions').delete().eq('id', existingFee.id)
      }
    } else {
      if (existingFee) {
        await supabase.from('transactions').update({
          account_id,
          amount: transferFeeAmount,
          transaction_date
        }).eq('id', existingFee.id)
      } else {
        await supabase.from('transactions').insert({
          workspace_id: workspaceId,
          account_id,
          type: 'expense',
          amount: transferFeeAmount,
          transaction_date,
          note: 'Bank Transfer Fee',
          linked_transaction_id: id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
      }
    }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budget')
  revalidatePath('/accounts')
}
