'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { addAccount } from './actions'

export function AddAccountForm() {
  const [accountType, setAccountType] = useState('bank')

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Add New Account</h2>
      <form action={addAccount} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Account Name</label>
          <input type="text" id="name" name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Main Checking" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Account Type</label>
          <select 
            id="type" 
            name="type" 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="bank">Bank Account</option>
            <option value="card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="wallet">Digital Wallet</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {(accountType === 'bank' || accountType === 'card') && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label htmlFor="bank_name" className="block text-sm font-medium text-foreground mb-1">Bank Name (Optional)</label>
            <input type="text" id="bank_name" name="bank_name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Chase, Bank of America" />
          </div>
        )}

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
  )
}
