'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { CategorySelect } from '@/components/CategorySelect'
import { editTransaction } from './actions'
import { useScrollLock } from '@/hooks/useScrollLock'

type Account = { id: string, name: string }
type Category = { id: string, name: string, type: string }
type Transaction = any // Using any for brevity, since we know what it contains

export function EditTransactionModal({ 
  transaction, 
  accounts, 
  categories 
}: { 
  transaction: Transaction, 
  accounts: Account[] | null, 
  categories: Category[] | null 
}) {
  const router = useRouter()
  const [type, setType] = useState(transaction.type)

  const close = () => {
    router.push('/transactions', { scroll: false })
  }

  useScrollLock(true)

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Edit Transaction</h2>
          <button onClick={close} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form action={async (formData) => {
          await editTransaction(formData)
          close()
        }} className="p-5 space-y-4">
          <input type="hidden" name="id" value={transaction.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit_type" className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select id="edit_type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit_transaction_date" className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input 
                type="date" 
                id="edit_transaction_date" 
                name="transaction_date" 
                required 
                defaultValue={transaction.transaction_date} 
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="edit_account_id" className="block text-sm font-medium text-foreground mb-1">Account</label>
            <select id="edit_account_id" name="account_id" required defaultValue={transaction.account_id} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {accounts?.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category (Optional)</label>
            <CategorySelect categories={categories as any} transactionType={type} defaultValue={transaction.category_id || ''} />
          </div>
          
          <div>
            <label htmlFor="edit_amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
            <input type="number" step="0.01" id="edit_amount" name="amount" required min="0.01" defaultValue={transaction.amount} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
          </div>

          <div>
            <label htmlFor="edit_note" className="block text-sm font-medium text-foreground mb-1">Note</label>
            <input type="text" id="edit_note" name="note" defaultValue={transaction.note || ''} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Description" />
          </div>

          <div className="pt-2">
            <SubmitButton type="submit" pendingText="Saving..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
