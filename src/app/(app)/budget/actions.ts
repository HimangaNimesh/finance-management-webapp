'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function createBudgetPeriod(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const start_date = formData.get('start_date') as string

  // Auto-calculate end_date and label
  const startDateObj = new Date(start_date + 'T12:00:00Z') // Use noon UTC to avoid timezone shifts
  const endDateObj = new Date(startDateObj)
  endDateObj.setUTCMonth(endDateObj.getUTCMonth() + 1)
  endDateObj.setUTCDate(endDateObj.getUTCDate() - 1)
  
  const end_date = endDateObj.toISOString().split('T')[0]
  
  const startStr = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const label = `${startStr} - ${endStr}`

  // First, deactivate all other periods
  await supabase
    .from('budget_periods')
    .update({ is_active: false })
    .eq('workspace_id', workspaceId)

  // Create new active period
  const { error } = await supabase.from('budget_periods').insert({
    workspace_id: workspaceId,
    start_date,
    end_date,
    label,
    is_active: true,
  })

  if (error) {
    throw new Error('Failed to create budget period: ' + error.message)
  }

  revalidatePath('/budget')
  revalidatePath('/settings')
}

export async function setAllocation(formData: FormData) {
  const supabase = await createClient()

  const budget_period_id = formData.get('budget_period_id') as string
  const category_id = formData.get('category_id') as string
  const allocated_amount = parseFloat(formData.get('allocated_amount') as string)

  // Let's do select first to avoid overwriting spent_amount incorrectly
  const { data: existing } = await supabase
    .from('budget_allocations')
    .select('id')
    .eq('budget_period_id', budget_period_id)
    .eq('category_id', category_id)
    .single()

  if (existing) {
    await supabase
      .from('budget_allocations')
      .update({ allocated_amount })
      .eq('id', existing.id)
  } else {
    // Calculate initial spent_amount from existing transactions in this category and its subcategories
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, category_id, category:categories(id, parent_category_id)')
      .eq('budget_period_id', budget_period_id)
      .eq('type', 'expense')

    let initialSpent = 0
    if (txs) {
      initialSpent = txs.reduce((sum, t) => {
        const isMatch = t.category_id === category_id || (t.category && t.category.parent_category_id === category_id)
        return isMatch ? sum + Number(t.amount) : sum
      }, 0)
    }

    await supabase
      .from('budget_allocations')
      .insert({ budget_period_id, category_id, allocated_amount, spent_amount: initialSpent })
  }

  revalidatePath('/budget')
}
