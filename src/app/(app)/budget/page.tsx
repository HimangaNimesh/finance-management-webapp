import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { createBudgetPeriod } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { WalletCards, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { SetAllocationModal } from './SetAllocationModal'

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
    .order('name', { ascending: true })

  let allocations: any[] = []
  if (activePeriod) {
    const { data } = await supabase
      .from('budget_allocations')
      .select('*, category:categories(name)')
      .eq('budget_period_id', activePeriod.id)
    allocations = data || []
  }

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
              <div className="p-6 space-y-6">
                {allocations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No allocations set yet. Add some to the right.</p>
                ) : (
                  allocations.map(allocation => {
                    const allocated = Number(allocation.allocated_amount)
                    const spent = Number(allocation.spent_amount)
                    const remaining = allocated - spent
                    const percentage = allocated > 0 ? Math.min(100, Math.max(0, (spent / allocated) * 100)) : 0
                    const isOver = spent > allocated
                    
                    return (
                      <div key={allocation.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="font-medium text-foreground">{allocation.category?.name || 'Unknown Category'}</span>
                          <div className="text-right text-sm">
                            <span className={isOver ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                              {formatCurrency(spent, currency)} spent
                            </span>
                            <span className="text-muted-foreground mx-1">/</span>
                            <span className="font-medium">{formatCurrency(allocated, currency)}</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isOver ? 'bg-destructive' : 'bg-primary'}`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          {isOver ? (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Over budget by {formatCurrency(Math.abs(remaining), currency)}
                            </span>
                          ) : (
                            <span className="text-success">{formatCurrency(remaining, currency)} remaining</span>
                          )}
                          <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
