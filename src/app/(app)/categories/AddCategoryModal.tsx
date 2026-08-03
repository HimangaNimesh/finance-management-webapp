'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { addCategory } from './actions'

type Category = {
  id: string
  name: string
  type: string
  parent_category_id?: string | null
}

export function AddCategoryModal({ categories }: { categories: Category[] | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState('expense')

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  const parentCategories = categories?.filter(c => !c.parent_category_id && c.type === type) || []

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Add Category</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              await addCategory(formData)
              setIsOpen(false)
            }} className="p-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input type="text" id="name" name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Groceries" />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="parent_category_id" className="block text-sm font-medium text-foreground mb-1">Parent Category (Optional)</label>
                <select id="parent_category_id" name="parent_category_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">None (Top Level)</option>
                  {parentCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <SubmitButton type="submit" pendingText="Adding..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
