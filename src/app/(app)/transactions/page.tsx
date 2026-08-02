import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { addTransaction, deleteTransaction } from './actions'
import { createTemplate, executeTemplate, deleteTemplate } from './template-actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Plus, Trash2, ArrowRightLeft, TrendingDown, TrendingUp, Zap, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export default async function TransactionsPage() {
  const { workspaceId, currency } = await getActiveWorkspace()
  const supabase = await createClient()

  // Fetch data for form
  const { data: accounts } = await supabase.from('accounts').select('id, name').eq('workspace_id', workspaceId)
  const { data: categories } = await supabase.from('categories').select('id, name, type').eq('workspace_id', workspaceId)

  // Fetch transactions with related data
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, account:accounts(name), category:categories(name)')
    .eq('workspace_id', workspaceId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch templates
  const { data: templates } = await supabase
    .from('transaction_templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-2">View and manage your recent transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {transactions?.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        {tx.type === 'expense' && <TrendingDown className="w-4 h-4 text-destructive" />}
                        {tx.type === 'income' && <TrendingUp className="w-4 h-4 text-success" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-medium">{tx.note || 'No description'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {tx.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {tx.account?.name || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      tx.type === 'expense' ? 'text-destructive' : tx.type === 'income' ? 'text-success' : 'text-foreground'
                    }`}>
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={async () => {
                        'use server'
                        await deleteTransaction(tx.id)
                      }}>
                        <SubmitButton type="submit" pendingText="..." className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:-mr-4 lg:pr-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Transaction</h2>
            <form action={addTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Type</label>
                  <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="transaction_date" className="block text-sm font-medium text-foreground mb-1">Date</label>
                  <input type="date" id="transaction_date" name="transaction_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              
              <div>
                <label htmlFor="account_id" className="block text-sm font-medium text-foreground mb-1">Account</label>
                <select id="account_id" name="account_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {accounts?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-foreground mb-1">Category (Optional)</label>
                <select id="category_id" name="category_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">None</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
                <input type="number" step="0.01" id="amount" name="amount" required min="0.01" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-foreground mb-1">Note</label>
                <input type="text" id="note" name="note" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Description" />
              </div>

              <SubmitButton type="submit" pendingText="Adding..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Transaction
              </SubmitButton>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Create Shortcut
            </h2>
            <form action={createTemplate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Shortcut Name</label>
                <input type="text" id="name" name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Netflix, Rent" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tpl_type" className="block text-sm font-medium text-foreground mb-1">Type</label>
                  <select id="tpl_type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tpl_amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
                  <input type="number" step="0.01" id="tpl_amount" name="amount" required min="0.01" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                </div>
              </div>
              
              <div>
                <label htmlFor="tpl_account_id" className="block text-sm font-medium text-foreground mb-1">Account</label>
                <select id="tpl_account_id" name="account_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {accounts?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tpl_category_id" className="block text-sm font-medium text-foreground mb-1">Category (Optional)</label>
                <select id="tpl_category_id" name="category_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">None</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <SubmitButton type="submit" pendingText="Saving..." className="w-full bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
                Save Shortcut
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
