'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { setAllocation } from './actions'
import { useScrollLock } from '@/hooks/useScrollLock'

type Category = {
  id: string
  name: string
}

export function SetAllocationModal({ 
  categories, 
  budgetPeriodId 
}: { 
  categories: Category[] | null
  budgetPeriodId: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock(isOpen)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Set Allocation
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Set Allocation</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              await setAllocation(formData)
              setIsOpen(false)
            }} className="p-5 space-y-4">
              <input type="hidden" name="budget_period_id" value={budgetPeriodId} />
              
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select id="category_id" name="category_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select a category</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="allocated_amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
                <input type="number" step="0.01" id="allocated_amount" name="allocated_amount" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
              </div>
              
              <div className="pt-2">
                <SubmitButton type="submit" pendingText="Saving..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Save Allocation
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
