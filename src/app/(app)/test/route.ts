import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { data: allPeriods } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('workspace_id', workspaceId)

  const transaction_date = '2026-09-17'

  const { data: matchingPeriod } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('workspace_id', workspaceId)
    .lte('start_date', transaction_date)
    .gte('end_date', transaction_date)

  const { data: txs } = await supabase
    .from('transactions')
    .select('*')
    .eq('workspace_id', workspaceId)
    
  return NextResponse.json({
    workspaceId,
    allPeriods,
    matchingPeriod,
    txs
  })
}
