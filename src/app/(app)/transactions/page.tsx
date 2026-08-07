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

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> | { edit?: string } }) {
  const resolvedSearchParams = await searchParams
  const { workspaceId, currency } = await getActiveWorkspace()
  const supabase = await createClient()

  // Fetch data for form
  const { data: accounts } = await supabase.from('accounts').select('id, name').eq('workspace_id', workspaceId)
  const { data: categories } = await supabase.from('categories').select('id, name, type, parent_category_id').eq('workspace_id', workspaceId)

  // Fetch transactions with related data
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, account:accounts!transactions_account_id_fkey(name), to_account:accounts!transactions_to_account_id_fkey(name), category:categories(name)')
    .eq('workspace_id', workspaceId)
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

  const groupedTransactions = transactions?.reduce((acc, tx) => {
    const date = tx.transaction_date
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0, items: [] }
    }
    if (tx.type === 'income') acc[date].income += Number(tx.amount)
    if (tx.type === 'expense') acc[date].expense += Number(tx.amount)
    acc[date].items.push(tx)
    return acc
  }, {} as Record<string, { date: string, income: number, expense: number, items: typeof transactions }>)

  const sortedDates = Object.keys(groupedTransactions || {}).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  const editingTx = resolvedSearchParams.edit ? transactions?.find(t => t.id === resolvedSearchParams.edit) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-2">View and manage your recent transactions.</p>
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

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-hidden md:overflow-x-auto">
              <table className="min-w-full divide-y divide-border block md:table">
                <thead className="bg-muted/30 hidden md:table-header-group">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background block md:table-row-group">
                {sortedDates.map((date) => {
                  const group = groupedTransactions![date]
                  return (
                    <Fragment key={date}>
                      <tr className="bg-muted/30 border-y border-border flex flex-col md:table-row">
                        <td colSpan={6} className="px-4 md:px-6 py-2.5 block md:table-cell w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {formatDate(date)}
                            </div>
                            <div className="flex items-center w-full sm:w-auto gap-4 text-xs font-medium mt-1 sm:mt-0">
                              {group.income > 0 && (
                                <span className="text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                                  <TrendingUp className="w-3 h-3" /> {formatCurrency(group.income, currency)}
                                </span>
                              )}
                              {group.expense > 0 && (
                                <span className="text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full ml-auto sm:ml-0">
                                  <TrendingDown className="w-3 h-3" /> {formatCurrency(group.expense, currency)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                      {group.items.map((tx) => (
                        <TransactionRowWrapper key={tx.id} txId={tx.id} className="hover:bg-muted/10 transition-colors flex flex-row items-center p-3 md:p-0 md:table-row border-b border-border md:border-0 last:border-0">
                          <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-muted-foreground/50">
                            {/* Date is shown in header */}
                          </td>
                          
                          <td className="w-1/4 md:w-auto px-1 md:px-6 py-1 md:py-3 whitespace-nowrap text-sm text-muted-foreground order-1 md:order-none block md:table-cell">
                            <div className="flex items-center gap-1 truncate">
                              <span className="md:hidden shrink-0">
                                {tx.type === 'expense' && <TrendingDown className="w-3 h-3 text-destructive" />}
                                {tx.type === 'income' && <TrendingUp className="w-3 h-3 text-success" />}
                                {tx.type === 'transfer' && <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />}
                              </span>
                              <span className="truncate">
                                {tx.type === 'transfer' ? `To: ${tx.to_account?.name || 'Unknown'}` : (tx.category?.name || '-')}
                              </span>
                            </div>
                          </td>

                          <td className="flex-1 px-2 md:px-6 py-1 md:py-3 text-sm text-foreground order-2 md:order-none block md:table-cell min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                              <div className="hidden md:flex items-center gap-2">
                                {tx.type === 'expense' && <TrendingDown className="w-4 h-4 text-destructive shrink-0" />}
                                {tx.type === 'income' && <TrendingUp className="w-4 h-4 text-success shrink-0" />}
                                {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4 text-muted-foreground shrink-0" />}
                              </div>
                              <span className="font-medium truncate block">{tx.note || 'No description'}</span>
                              <span className="text-xs text-muted-foreground block md:hidden truncate">
                                {tx.type === 'transfer' ? `${tx.account?.name} → ${tx.to_account?.name}` : (tx.account?.name || '-')}
                              </span>
                            </div>
                          </td>
                          
                          <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {tx.type === 'transfer' ? `${tx.account?.name} → ${tx.to_account?.name}` : (tx.account?.name || '-')}
                          </td>
                          
                          <td className={`px-2 md:px-6 py-1 md:py-3 whitespace-nowrap text-sm font-medium text-right order-3 md:order-none block md:table-cell shrink-0 ${
                            tx.type === 'expense' ? 'text-destructive' : tx.type === 'income' ? 'text-success' : 'text-foreground'
                          }`}>
                            {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                            {formatCurrency(tx.amount, currency)}
                          </td>
                          
                          <td className="px-0 md:px-6 py-1 md:py-3 whitespace-nowrap text-right text-sm font-medium order-4 md:order-none block md:table-cell shrink-0">
                            <DeleteTransactionButton id={tx.id} deleteAction={deleteTransaction} />
                          </td>
                        </TransactionRowWrapper>
                      ))}
                    </Fragment>
                  )
                })}
                {sortedDates.length === 0 && (
                  <tr className="block md:table-row">
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground block md:table-cell">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {editingTx && <EditTransactionModal transaction={editingTx} accounts={accounts} categories={categories} />}
    </div>
  )
}
