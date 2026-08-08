import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { removeMember, updateCurrency, updateProfileName, renameWorkspace, updateTransferFee, updateAtmFee } from './actions'
import { createBudgetPeriod } from '@/app/(app)/budget/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { InviteForm } from './InviteForm'
import { Users, Mail, UserMinus, ShieldAlert, Calendar } from 'lucide-react'

export default async function SettingsPage() {
  const { workspaceId, workspaceName, currency, transferFeeAmount, atmFeeAmount } = await getActiveWorkspace()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const fullName = user?.user_metadata?.full_name || ''

  const { data: members } = await supabase
    .from('workspace_members')
    .select('role, user_id, joined_at')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true })

  // Find if current user is owner
  const isOwner = members?.some(m => m.user_id === user?.id && m.role === 'owner')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your workspace and members.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-1">Workspace Info</h2>
        <p className="text-sm text-muted-foreground mb-4">Your current active workspace.</p>

        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <form action={renameWorkspace} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label htmlFor="workspace_name" className="block text-sm font-medium text-foreground mb-1">Workspace Name</label>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="workspace_name"
                  name="name"
                  defaultValue={workspaceName}
                  required
                  disabled={!isOwner}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            {isOwner && (
              <SubmitButton type="submit" pendingText="Saving..." className="w-full sm:w-auto bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors shrink-0">
                Rename
              </SubmitButton>
            )}
          </form>
          <p className="text-xs text-muted-foreground mt-4 ml-12">Workspace ID: {workspaceId}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Members</h2>
            <p className="text-sm text-muted-foreground">People who have access to this workspace.</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {members?.map(member => (
            <div key={member.user_id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  {member.role === 'owner' ? 'O' : 'M'}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {member.user_id === user?.id ? `You (${fullName || 'No name set'})` : 'User ' + member.user_id.substring(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                    {member.role} {member.role === 'owner' && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                  </p>
                </div>
              </div>

              {isOwner && member.user_id !== user?.id && (
                <form action={async () => {
                  'use server'
                  await removeMember(member.user_id)
                }}>
                  <SubmitButton type="submit" pendingText="Removing..." className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                    <UserMinus className="w-4 h-4" /> Remove
                  </SubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-1">Your Profile</h2>
        <p className="text-sm text-muted-foreground mb-4">Update your personal information.</p>

        <form action={updateProfileName} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              defaultValue={fullName}
              placeholder="Your Name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <SubmitButton type="submit" pendingText="Saving..." className="bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors">
            Save Changes
          </SubmitButton>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-1">Currency Preferences</h2>
        <p className="text-sm text-muted-foreground mb-4">Set the base currency for all financial data in this workspace.</p>

        <form action={updateCurrency} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-1">Workspace Currency</label>
            <select
              id="currency"
              name="currency"
              defaultValue={currency}
              disabled={!isOwner}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
              <option value="LKR">LKR (Rs)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
          <SubmitButton type="submit" pendingText="Saving..." className="bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors">
            Save Changes
          </SubmitButton>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-1">Bank Transfer Fee</h2>
        <p className="text-sm text-muted-foreground mb-4">Set the default automatic fee deducted when transferring money between bank accounts.</p>

        <form action={updateTransferFee} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label htmlFor="transfer_fee_amount" className="block text-sm font-medium text-foreground mb-1">Fee Amount ({currency})</label>
            <input
              type="number"
              step="0.01"
              id="transfer_fee_amount"
              name="transfer_fee_amount"
              defaultValue={transferFeeAmount}
              disabled={!isOwner}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <SubmitButton type="submit" pendingText="Saving..." className="bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors">
            Save Changes
          </SubmitButton>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-1">ATM Fee</h2>
        <p className="text-sm text-muted-foreground mb-4">Set the default automatic fee deducted when making ATM transfers.</p>

        <form action={updateAtmFee} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label htmlFor="atm_fee_amount" className="block text-sm font-medium text-foreground mb-1">Fee Amount ({currency})</label>
            <input
              type="number"
              step="0.01"
              id="atm_fee_amount"
              name="atm_fee_amount"
              defaultValue={atmFeeAmount}
              disabled={!isOwner}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <SubmitButton type="submit" pendingText="Saving..." className="bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors">
            Save Changes
          </SubmitButton>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-1">Budget Period</h2>
        <p className="text-sm text-muted-foreground mb-4">Start a new budget period for this workspace. This will deactivate the current one.</p>

        <form action={createBudgetPeriod} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full sm:max-w-xs">
            <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-1">Start Date</label>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <input 
                type="date" 
                id="start_date" 
                name="start_date" 
                required 
                disabled={!isOwner}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 ml-12">Automatically spans one full month.</p>
          </div>
          {isOwner && (
            <SubmitButton type="submit" pendingText="Starting..." className="w-full sm:w-auto bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors shrink-0">
              Start New Period
            </SubmitButton>
          )}
        </form>
      </div>

      {isOwner && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-1">Invite Member</h2>
          <p className="text-sm text-muted-foreground mb-4">Invite someone to collaborate on your budget. They must sign up for an account first.</p>

          <InviteForm />
        </div>
      )}
    </div>
  )
}
