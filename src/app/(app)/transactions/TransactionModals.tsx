'use client'

import { useState, useEffect } from 'react'
import { Plus, Zap, X } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { CategorySelect } from '@/components/CategorySelect'
import { addTransaction } from './actions'
import { createTemplate } from './template-actions'

type Account = { id: string, name: string }
type Category = { id: string, name: string, type: string }

export function TransactionModals({ accounts, categories }: { accounts: Account[] | null, categories: Category[] | null }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isShortcutOpen, setIsShortcutOpen] = useState(false)
  const [addType, setAddType] = useState('expense')
  const [shortcutType, setShortcutType] = useState('expense')

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isAddOpen || isShortcutOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isAddOpen, isShortcutOpen])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button 
        onClick={() => setIsAddOpen(true)}
        className="bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Transaction
      </button>

      <button 
        onClick={() => setIsShortcutOpen(true)}
        className="bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors flex items-center gap-2"
      >
        <Zap className="w-4 h-4" />
        Create Shortcut
      </button>

      {/* Add Transaction Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Add Transaction</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              await addTransaction(formData)
              setIsAddOpen(false)
            }} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Type</label>
                  <select id="type" name="type" value={addType} onChange={(e) => setAddType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="transaction_date" className="block text-sm font-medium text-foreground mb-1">Date</label>
                  <input 
                    type="date" 
                    id="transaction_date" 
                    name="transaction_date" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
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
                <label className="block text-sm font-medium text-foreground mb-1">Category (Optional)</label>
                <CategorySelect categories={categories as any} transactionType={addType} />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
                <input type="number" step="0.01" id="amount" name="amount" required min="0.01" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-foreground mb-1">Note</label>
                <input type="text" id="note" name="note" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Description" />
              </div>

              <div className="pt-2">
                <SubmitButton type="submit" pendingText="Adding..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Shortcut Modal */}
      {isShortcutOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Create Shortcut
              </h2>
              <button onClick={() => setIsShortcutOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              await createTemplate(formData)
              setIsShortcutOpen(false)
            }} className="p-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Shortcut Name</label>
                <input type="text" id="name" name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Netflix, Rent" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tpl_type" className="block text-sm font-medium text-foreground mb-1">Type</label>
                  <select id="tpl_type" name="type" value={shortcutType} onChange={(e) => setShortcutType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
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
                <label className="block text-sm font-medium text-foreground mb-1">Category (Optional)</label>
                <CategorySelect categories={categories as any} transactionType={shortcutType} />
              </div>

              <div className="pt-2">
                <SubmitButton type="submit" pendingText="Saving..." className="w-full bg-secondary text-secondary-foreground font-medium rounded-md py-2 px-4 hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
                  Save Shortcut
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
