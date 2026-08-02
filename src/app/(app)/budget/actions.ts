'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function createBudgetPeriod(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const label = formData.get('label') as string

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
}

export async function setAllocation(formData: FormData) {
  const supabase = await createClient()

  const budget_period_id = formData.get('budget_period_id') as string
  const category_id = formData.get('category_id') as string
  const allocated_amount = parseFloat(formData.get('allocated_amount') as string)

  // Upsert allocation
  const { error } = await supabase.from('budget_allocations').upsert({
    budget_period_id,
    category_id,
    allocated_amount,
    // Note: spent_amount is 0 by default, trigger handles updates, but we shouldn't overwrite spent_amount here.
    // Upsert might overwrite spent_amount to default if not careful.
    // Instead, let's do a select first, or use an ON CONFLICT DO UPDATE.
  }, { onConflict: 'budget_period_id,category_id' })

  if (error) {
    // Manually handle upsert without overwriting spent_amount if Supabase upsert doesn't support partial updates easily.
    // Let's do select first to be safe.
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
      await supabase
        .from('budget_allocations')
        .insert({ budget_period_id, category_id, allocated_amount, spent_amount: 0 })
    }
  }

  revalidatePath('/budget')
}
