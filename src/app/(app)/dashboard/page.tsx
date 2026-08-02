import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { Landmark, TrendingUp, TrendingDown, ArrowRight, AlertCircle, Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { executeTemplate } from '@/app/(app)/transactions/template-actions'
import { SubmitButton } from '@/components/SubmitButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const { workspaceId, workspaceName, currency } = await getActiveWorkspace()
  const supabase = await createClient()

  // Accounts Balance
  const { data: accounts } = await supabase.from('accounts').select('current_balance').eq('workspace_id', workspaceId)
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0

  // Active Budget Period
  const { data: activePeriod } = await supabase
    .from('budget_periods')
    .select('id, label, start_date, end_date')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
    .single()

  let totalAllocated = 0
  let totalSpent = 0
  let allocations: any[] = []

  if (activePeriod) {
    const { data } = await supabase
      .from('budget_allocations')
      .select('*, category:categories(name)')
      .eq('budget_period_id', activePeriod.id)
    
    if (data) {
      allocations = data
      totalAllocated = data.reduce((sum, a) => sum + Number(a.allocated_amount), 0)
      totalSpent = data.reduce((sum, a) => sum + Number(a.spent_amount), 0)
    }
  }

  // Recent Transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(name)')
    .eq('workspace_id', workspaceId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  // Quick Actions (Templates)
  const { data: templates } = await supabase
    .from('transaction_templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(10)

  const budgetPercentage = totalAllocated > 0 ? Math.min(100, Math.max(0, (totalSpent / totalAllocated) * 100)) : 0

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to {workspaceName}</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Landmark className="w-24 h-24 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1 relative z-10">Total Balance</p>
          <h2 className={`text-4xl font-bold relative z-10 ${totalBalance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {formatCurrency(totalBalance, currency)}
          </h2>
        </div>

        <div className="md:col-span-2 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Budget</p>
              {activePeriod ? (
                <h3 className="text-xl font-bold text-foreground">{activePeriod.label}</h3>
              ) : (
                <h3 className="text-xl font-bold text-muted-foreground">No active period</h3>
              )}
            </div>
            {activePeriod && (
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1">Spent / Allocated</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(totalSpent, currency)} <span className="text-muted-foreground text-sm font-normal">/ {formatCurrency(totalAllocated, currency)}</span>
                </p>
              </div>
            )}
          </div>

          {activePeriod ? (
            <div className="space-y-2">
              <div className="w-full bg-background/50 h-3 rounded-full overflow-hidden border border-border/50">
                <div 
                  className={`h-full rounded-full ${totalSpent > totalAllocated ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{budgetPercentage.toFixed(0)}% used</span>
                <span className="text-muted-foreground">{formatCurrency(Math.max(0, totalAllocated - totalSpent), currency)} remaining</span>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Link href="/budget" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                Start a budget period <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {templates && templates.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {templates.map(template => (
              <form key={template.id} action={async () => {
                'use server'
                await executeTemplate(template.id)
              }}>
                <SubmitButton type="submit" pendingText="..." className="bg-card border border-border rounded-lg shadow-sm hover:border-primary/50 transition-colors px-4 py-2 text-sm font-medium flex items-center gap-2">
                  {template.type === 'expense' && <TrendingDown className="w-3 h-3 text-destructive" />}
                  {template.type === 'income' && <TrendingUp className="w-3 h-3 text-success" />}
                  {template.name} ({formatCurrency(template.amount, currency)})
                </SubmitButton>
              </form>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Recent Transactions</h3>
            <Link href="/transactions" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y divide-border">
              {transactions?.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'expense' ? 'bg-destructive/10 text-destructive' : tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {tx.type === 'expense' && <TrendingDown className="w-5 h-5" />}
                      {tx.type === 'income' && <TrendingUp className="w-5 h-5" />}
                      {tx.type === 'transfer' && <ArrowRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.note || 'No description'}</p>
                      <p className="text-xs text-muted-foreground">{tx.category?.name || 'Uncategorized'} • {formatDate(tx.transaction_date)}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'expense' ? 'text-destructive' : tx.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount, currency)}
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <div className="p-8 text-center text-muted-foreground">
                  No transactions yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-foreground">Budget Usage</h3>
            <Link href="/budget" className="text-sm text-primary hover:underline font-medium">Manage</Link>
          </div>
          <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[400px]">
            {allocations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No budget allocations active.
              </div>
            ) : (
              allocations
                .sort((a, b) => (Number(b.spent_amount) / Number(b.allocated_amount)) - (Number(a.spent_amount) / Number(a.allocated_amount)))
                .slice(0, 5)
                .map(allocation => {
                  const allocated = Number(allocation.allocated_amount)
                  const spent = Number(allocation.spent_amount)
                  const percentage = allocated > 0 ? Math.min(100, Math.max(0, (spent / allocated) * 100)) : 0
                  const isOver = spent > allocated
                  
                  return (
                    <div key={allocation.id} className="space-y-2">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-medium text-foreground">{allocation.category?.name || 'Unknown'}</span>
                        <div className="text-right">
                          <span className={isOver ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                            {formatCurrency(spent, currency)}
                          </span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span className="font-medium">{formatCurrency(allocated, currency)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isOver ? 'bg-destructive' : percentage > 80 ? 'bg-orange-500' : 'bg-primary'}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
