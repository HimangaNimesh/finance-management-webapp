'use client'

import { useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { setAllocation } from './actions'
import { useScrollLock } from '@/hooks/useScrollLock'

type Allocation = {
  id: string
  category_id: string
  category_name: string
  allocated_amount: number
  budget_period_id: string
}

export function EditAllocationModal({ allocation }: { allocation: Allocation }) {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock(isOpen)

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
        title="Edit Allocation"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Edit Allocation</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              await setAllocation(formData)
              setIsOpen(false)
            }} className="p-5 space-y-4">
              <input type="hidden" name="budget_period_id" value={allocation.budget_period_id} />
              <input type="hidden" name="category_id" value={allocation.category_id} />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <input type="text" disabled value={allocation.category_name || 'Unknown Category'} className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
              </div>
              
              <div>
                <label htmlFor="allocated_amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
                <input type="number" step="0.01" id="allocated_amount" name="allocated_amount" required defaultValue={allocation.allocated_amount} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
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
      )}
    </>
  )
}
