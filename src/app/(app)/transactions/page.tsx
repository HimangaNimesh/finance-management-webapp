import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { deleteTransaction } from './actions'
import { executeTemplate, deleteTemplate } from './template-actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Trash2, ArrowRightLeft, TrendingDown, TrendingUp, Zap, X, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { Fragment } from 'react'
import { TransactionModals } from './TransactionModals'
import { TransactionRowWrapper } from './TransactionRowWrapper'
import { EditTransactionModal } from './EditTransactionModal'
import { DeleteTransactionButton } from './DeleteTransactionButton'
import { TransactionList } from './TransactionList'

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ edit?: string, accountId?: string }> | { edit?: string, accountId?: string } }) {
  const resolvedSearchParams = await searchParams
  const { workspaceId, currency } = await getActiveWorkspace()
  const supabase = await createClient()

  // Fetch data for form
  const { data: accounts } = await supabase.from('accounts').select('id, name').eq('workspace_id', workspaceId)
  const { data: categories } = await supabase.from('categories').select('id, name, type, parent_category_id').eq('workspace_id', workspaceId)

  // Fetch transactions with related data
  let query = supabase
    .from('transactions')
    .select('*, account:accounts!transactions_account_id_fkey(name), to_account:accounts!transactions_to_account_id_fkey(name), category:categories(name)')
    .eq('workspace_id', workspaceId)
    
  if (resolvedSearchParams.accountId) {
    query = query.or(`account_id.eq.${resolvedSearchParams.accountId},to_account_id.eq.${resolvedSearchParams.accountId}`)
  }

  const { data: txs } = await query
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch templates
  const { data: templates } = await supabase
    .from('transaction_templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  const transactions = txs || []
  
  const editingTx = resolvedSearchParams.edit ? transactions?.find(t => t.id === resolvedSearchParams.edit) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {resolvedSearchParams.accountId ? (
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {accounts?.find(a => a.id === resolvedSearchParams.accountId)?.name}
              </h1>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">Account Filter</span>
            </div>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          )}
          <p className="text-muted-foreground mt-2">
            {resolvedSearchParams.accountId ? (
              <a href="/accounts" className="text-primary hover:underline flex items-center gap-1 text-sm mt-1">
                &larr; Back to Accounts
              </a>
            ) : (
              'View and manage your recent transactions.'
            )}
          </p>
        </div>
        <TransactionModals accounts={accounts} categories={categories} />
      </div>

      <div className="space-y-6">
        <div>
          {templates && templates.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                {templates.map(template => (
                  <div key={template.id} className="group relative flex items-center bg-card border border-border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                    <form action={async () => {
                      'use server'
                      await executeTemplate(template.id)
                    }}>
                      <SubmitButton type="submit" pendingText="..." className="px-4 py-2 text-sm font-medium flex items-center gap-2">
                        {template.type === 'expense' && <TrendingDown className="w-3 h-3 text-destructive" />}
                        {template.type === 'income' && <TrendingUp className="w-3 h-3 text-success" />}
                        {template.name} ({formatCurrency(template.amount, currency)})
                      </SubmitButton>
                    </form>
                    <form action={async () => {
                      'use server'
                      await deleteTemplate(template.id)
                    }}>
                      <SubmitButton type="submit" className="px-2 py-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity border-l border-border">
                        <X className="w-3 h-3" />
                      </SubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          <TransactionList 
            initialTransactions={transactions} 
            currency={currency} 
            accountId={resolvedSearchParams.accountId} 
          />
        </div>
      </div>
      {editingTx && <EditTransactionModal transaction={editingTx} accounts={accounts} categories={categories} />}
    </div>
  )
}
