import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { Landmark } from 'lucide-react'
import { AccountCard } from './AccountCard'
import { AddAccountForm } from './AddAccountForm'

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
          <AddAccountForm />
        </div>
      </div>
    </div>
  )
}
