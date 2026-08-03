'use client'

import { Trash2 } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'

export function DeleteTransactionButton({ 
  id, 
  deleteAction 
}: { 
  id: string, 
  deleteAction: (id: string) => Promise<void> 
}) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <form action={async () => {
        await deleteAction(id)
      }}>
        <SubmitButton type="submit" pendingText="..." className="text-muted-foreground hover:text-destructive transition-colors p-1 md:p-2 relative z-10">
          <Trash2 className="w-4 h-4" />
        </SubmitButton>
      </form>
    </div>
  )
}
