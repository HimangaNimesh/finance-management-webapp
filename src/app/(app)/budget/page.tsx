import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { createBudgetPeriod } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { WalletCards, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { SetAllocationModal } from './SetAllocationModal'
import { AllocationProgressBar } from './AllocationProgressBar'

export default async function BudgetPage() {
  const { workspaceId, currency } = await getActiveWorkspace()
  const supabase = await createClient()

  // Fetch active budget period
  const { data: activePeriod } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
    .single()

  // Fetch categories (expenses only)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('type', 'expense')
    .is('parent_category_id', null)
    .order('name', { ascending: true })

  let allocations: any[] = []
  let transactions: any[] = []
  
  if (activePeriod) {
    const { data } = await supabase
      .from('budget_allocations')
      .select('*, category:categories(name)')
      .eq('budget_period_id', activePeriod.id)
    allocations = data || []
    
    // Fetch transactions for breakdown
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, category_id, category:categories(id, name, parent_category_id)')
      .eq('budget_period_id', activePeriod.id)
      .eq('type', 'expense')
    transactions = txs || []
  }

  // Pre-calculate subcategory breakdowns
  const categoryBreakdowns: Record<string, any[]> = {}
  const shadeColors = [
    'bg-primary',
    'bg-primary/80',
    'bg-primary/60',
    'bg-primary/40',
    'bg-primary/30',
    'bg-primary/20',
  ]

  allocations.forEach(allocation => {
    const mainCategoryId = allocation.category_id
    
    // Find all transactions that belong to this main category or its subcategories
    const relatedTxs = transactions.filter(t => 
      t.category_id === mainCategoryId || 
      (t.category && t.category.parent_category_id === mainCategoryId)
    )
    
    // Group them by their exact category
    const grouped: Record<string, { id: string, name: string, amount: number }> = {}
    
    relatedTxs.forEach(t => {
      const catId = t.category_id
      if (!grouped[catId]) {
        grouped[catId] = {
          id: catId,
          name: t.category?.name || 'Unknown',
          amount: 0
        }
      }
      grouped[catId].amount += Number(t.amount)
    })
    
    // Convert to array and sort by amount descending
    const breakdownArray = Object.values(grouped).sort((a, b) => b.amount - a.amount)
    
    // Assign shades
    categoryBreakdowns[mainCategoryId] = breakdownArray.map((item, index) => ({
      ...item,
      colorClass: shadeColors[index % shadeColors.length]
    }))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Budget</h1>
          <p className="text-muted-foreground mt-2">Plan your spending for the current period.</p>
        </div>
        {activePeriod && <SetAllocationModal categories={categories} budgetPeriodId={activePeriod.id} />}
      </div>

      {!activePeriod ? (
        <div className="bg-card border border-border rounded-xl p-8 max-w-xl mx-auto shadow-sm">
          <div className="text-center mb-6">
            <WalletCards className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Start a New Budget</h2>
            <p className="text-muted-foreground mt-2">You don't have an active budget period. Create one to start tracking your allocations.</p>
          </div>
          <form action={createBudgetPeriod} className="space-y-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-1">Start Date</label>
              <input type="date" id="start_date" name="start_date" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-xs text-muted-foreground mt-1">The budget period will automatically span one full month from this date.</p>
            </div>
            <SubmitButton type="submit" pendingText="Saving..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors mt-4">
              Start Budget Period
            </SubmitButton>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {activePeriod.label}
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold">Active</span>
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {formatDate(activePeriod.start_date)} — {formatDate(activePeriod.end_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(allocations.reduce((sum, a) => sum + Number(a.allocated_amount), 0), currency)}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-lg text-foreground">Category Allocations</h3>
              </div>
              <div className="p-6 space-y-2">
                {allocations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No allocations set yet. Add some to the right.</p>
                ) : (
                  allocations.map(allocation => (
                    <AllocationProgressBar 
                      key={allocation.id}
                      allocation={{
                        id: allocation.id,
                        budget_period_id: allocation.budget_period_id,
                        category_id: allocation.category_id,
                        category_name: allocation.category?.name || 'Unknown Category',
                        allocated_amount: Number(allocation.allocated_amount),
                        spent_amount: Number(allocation.spent_amount)
                      }}
                      breakdown={categoryBreakdowns[allocation.category_id] || []}
                      currency={currency}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
