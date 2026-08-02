import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { addAccount } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Landmark, Plus } from 'lucide-react'
import { AccountCard } from './AccountCard'

export default async function AccountsPage() {
  const { workspaceId, currency } = await getActiveWorkspace()
  const supabase = await createClient()

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Accounts</h1>
        <p className="text-muted-foreground mt-2">Manage your bank accounts, credit cards, and cash.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {accounts?.map((account) => (
            <AccountCard key={account.id} account={account} currency={currency} />
          ))}
          {accounts?.length === 0 && (
            <div className="text-center p-12 border border-dashed border-border rounded-xl">
              <Landmark className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">No accounts</h3>
              <p className="text-muted-foreground mt-1">Add your first account to get started.</p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add New Account</h2>
            <form action={addAccount} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Account Name</label>
                <input type="text" id="name" name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Main Checking" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Account Type</label>
                <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="bank">Bank Account</option>
                  <option value="card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Digital Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="starting_balance" className="block text-sm font-medium text-foreground mb-1">Starting Balance</label>
                <input type="number" step="0.01" id="starting_balance" name="starting_balance" required defaultValue={0} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <SubmitButton type="submit" pendingText="Adding..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Account
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
