'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { deleteAllocation } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export function DeleteAllocationButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (showConfirm) {
    return (
      <div 
        className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-md px-2 py-1 absolute right-2 z-10 shadow-sm border border-destructive/20"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-medium whitespace-nowrap">Delete?</span>
        <form action={async (formData) => {
          await deleteAllocation(formData)
          setShowConfirm(false)
        }}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton type="submit" className="text-xs font-bold hover:underline">
            Yes
          </SubmitButton>
        </form>
        <button 
          type="button" 
          onClick={(e) => { e.preventDefault(); setShowConfirm(false); }}
          className="text-xs hover:underline text-muted-foreground ml-1"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
      className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-muted"
      title="Delete Allocation"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
