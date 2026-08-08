'use client'

import { useState } from 'react'
import { Landmark, Trash2, Edit2, X, Check } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { SubmitButton } from '@/components/SubmitButton'
import { deleteAccount, editAccount } from './actions'

type Account = {
  id: string
  name: string
  type: string
  starting_balance: number
  current_balance: number
  bank_name?: string | null
  is_savings_account?: boolean | null
}

export function AccountCard({ account, currency }: { account: Account, currency: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editType, setEditType] = useState(account.type)

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <form action={async (formData) => {
          await editAccount(formData)
          setIsEditing(false)
        }} className="space-y-4">
          <input type="hidden" name="id" value={account.id} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`name-${account.id}`} className="block text-xs font-medium text-muted-foreground mb-1">Account Name</label>
              <input type="text" id={`name-${account.id}`} name="name" defaultValue={account.name} required className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            
            <div>
              <label htmlFor={`type-${account.id}`} className="block text-xs font-medium text-muted-foreground mb-1">Account Type</label>
              <select 
                id={`type-${account.id}`} 
                name="type" 
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bank">Bank Account</option>
                <option value="card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="wallet">Digital Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>

            {(editType === 'bank' || editType === 'card') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label htmlFor={`bank-${account.id}`} className="block text-xs font-medium text-muted-foreground mb-1">Bank Name (Optional)</label>
                <input type="text" id={`bank-${account.id}`} name="bank_name" defaultValue={account.bank_name || ''} className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            )}

            {editType === 'bank' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
                <input type="checkbox" id={`savings-${account.id}`} name="is_savings_account" value="true" defaultChecked={account.is_savings_account || false} className="rounded border-input text-primary focus:ring-primary" />
                <label htmlFor={`savings-${account.id}`} className="text-xs font-medium text-foreground">Savings Account</label>
              </div>
            )}

            <div>
              <label htmlFor={`balance-${account.id}`} className="block text-xs font-medium text-muted-foreground mb-1">Starting Balance</label>
              <input type="number" step="0.01" id={`balance-${account.id}`} name="starting_balance" defaultValue={account.starting_balance} required className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1">
              <X className="w-4 h-4" /> Cancel
            </button>
            <SubmitButton type="submit" pendingText="Saving..." className="bg-primary text-primary-foreground font-medium rounded-md py-1.5 px-3 hover:bg-indigo-500 transition-colors flex items-center gap-1">
              <Check className="w-4 h-4" /> Save
            </SubmitButton>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div 
      className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4 sm:gap-0 cursor-pointer"
      onClick={() => window.location.href = `/transactions?accountId=${account.id}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">{account.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {account.is_savings_account ? 'Savings ' : ''}{account.type} {account.bank_name ? `• ${account.bank_name}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <div className="text-right flex-1 sm:flex-none">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
          <p className={`font-bold text-xl ${account.current_balance >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(account.current_balance, currency)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" 
            title="Edit account"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <form action={async () => {
            if (confirm('Are you sure you want to delete this account?')) {
              await deleteAccount(account.id)
            }
          }} onClick={(e) => e.stopPropagation()}>
            <SubmitButton type="submit" pendingText="..." className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete account">
              <Trash2 className="w-4 h-4" />
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}
