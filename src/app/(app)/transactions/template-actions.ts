'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function createTemplate(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const amount = Number(formData.get('amount'))
  const type = formData.get('type') as string
  const account_id = formData.get('account_id') as string
  const category_id = formData.get('category_id') as string || null

  const { error } = await supabase
    .from('transaction_templates')
    .insert({
      workspace_id: workspaceId,
      name,
      amount,
      type,
      account_id,
      category_id
    })

  if (error) {
    throw new Error('Failed to create shortcut: ' + error.message)
  }

  revalidatePath('/transactions')
}

export async function deleteTemplate(templateId: string) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { error } = await supabase
    .from('transaction_templates')
    .delete()
    .eq('id', templateId)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw new Error('Failed to delete shortcut: ' + error.message)
  }

  revalidatePath('/transactions')
}

export async function executeTemplate(templateId: string) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  // 1. Get the template
  const { data: template, error: templateError } = await supabase
    .from('transaction_templates')
    .select('*')
    .eq('id', templateId)
    .eq('workspace_id', workspaceId)
    .single()

  if (templateError || !template) {
    throw new Error('Failed to load shortcut')
  }

  // 2. Determine budget period for expenses
  let budgetPeriodId = null
  if (template.type === 'expense') {
    const { data: period } = await supabase
      .from('budget_periods')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .single()
    
    if (period) {
      budgetPeriodId = period.id
    }
  }

  // 3. Insert transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      workspace_id: workspaceId,
      amount: template.amount,
      type: template.type,
      account_id: template.account_id,
      category_id: template.category_id,
      budget_period_id: budgetPeriodId,
      transaction_date: new Date().toISOString().split('T')[0],
      note: template.name + ' (Shortcut)'
    })

  if (txError) {
    throw new Error('Failed to create transaction: ' + txError.message)
  }

  // 4. Update account balance
  const { data: account } = await supabase
    .from('accounts')
    .select('current_balance')
    .eq('id', template.account_id)
    .single()

  if (account) {
    const newBalance = template.type === 'expense' 
      ? account.current_balance - template.amount
      : account.current_balance + template.amount

    await supabase
      .from('accounts')
      .update({ current_balance: newBalance })
      .eq('id', template.account_id)
  }

  // 5. Update budget allocation if expense and has category and budget period
  if (template.type === 'expense' && template.category_id && budgetPeriodId) {
    const { data: allocation } = await supabase
      .from('budget_allocations')
      .select('id, spent_amount')
      .eq('budget_period_id', budgetPeriodId)
      .eq('category_id', template.category_id)
      .single()

    if (allocation) {
      await supabase
        .from('budget_allocations')
        .update({ spent_amount: allocation.spent_amount + template.amount })
        .eq('id', allocation.id)
    }
  }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budget')
  revalidatePath('/accounts')
}
