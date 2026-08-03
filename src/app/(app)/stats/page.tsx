import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { StatsChart } from './StatsChart'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PieChart } from 'lucide-react'
import { PeriodSelector } from './PeriodSelector'
import { formatDate } from '@/utils/format'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function StatsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const { workspaceId, currency } = await getActiveWorkspace()
  const supabase = await createClient()
  
  const periodIdParam = searchParams.periodId as string | undefined

  // Fetch all budget periods for the selector
  const { data: periods } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('start_date', { ascending: false })

  if (!periods || periods.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-2">Visualize your spending patterns over time.</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 max-w-xl mx-auto shadow-sm text-center">
          <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-foreground">No Budget Periods Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">You need to start a budget period to view statistics.</p>
          <Link href="/settings" className="bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-primary/90 transition-colors inline-block">
            Go to Settings
          </Link>
        </div>
      </div>
    )
  }

  // Determine current period
  let currentPeriod = periods.find(p => p.id === periodIdParam)
  if (!currentPeriod) {
    currentPeriod = periods.find(p => p.is_active) || periods[0]
  }

  // Fetch transactions for this period
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, category_id, category:categories(name)')
    .eq('workspace_id', workspaceId)
    .eq('budget_period_id', currentPeriod.id)

  // Aggregate data
  const expenseMap = new Map<string, number>()
  const incomeMap = new Map<string, number>()

  transactions?.forEach(tx => {
    const amount = Number(tx.amount)
    // TypeScript workaround since Supabase might type joined data as an array
    const catName = Array.isArray(tx.category) 
      ? tx.category[0]?.name 
      : (tx.category as any)?.name || 'Uncategorized'
      
    if (tx.type === 'expense') {
      expenseMap.set(catName, (expenseMap.get(catName) || 0) + amount)
    } else if (tx.type === 'income') {
      incomeMap.set(catName, (incomeMap.get(catName) || 0) + amount)
    }
  })

  const COLORS = [
    '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', 
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
  ]

  const formatData = (map: Map<string, number>) => {
    return Array.from(map.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value) // Sort by largest value
  }

  const expenseData = formatData(expenseMap)
  const incomeData = formatData(incomeMap)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-2">Visualize your spending patterns over time.</p>
        </div>
        
        {/* Period Selector */}
        <PeriodSelector periods={periods} currentPeriodId={currentPeriod.id} />
      </div>

      {transactions?.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg p-4 flex items-center gap-3">
          <p className="text-sm font-medium">No transactions found for this period. The charts below might be empty.</p>
        </div>
      )}

      <StatsChart 
        expenseData={expenseData}
        incomeData={incomeData}
        currency={currency}
      />
    </div>
  )
}
