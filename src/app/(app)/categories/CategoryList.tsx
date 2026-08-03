'use client'

import { useState } from 'react'
import { Tags, Trash2, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'
import { deleteCategory } from './actions'

type Category = {
  id: string
  name: string
  type: string
  parent_category_id?: string | null
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({})

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">No categories found</p>
      </div>
    )
  }

  // group by parent
  const parents = categories.filter(c => !c.parent_category_id)
  const children = categories.filter(c => c.parent_category_id)

  const toggleExpand = (parentId: string) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }))
  }

  return (
    <div className="space-y-3">
      {parents.map(parent => {
        const parentChildren = children.filter(c => c.parent_category_id === parent.id)
        const hasChildren = parentChildren.length > 0
        const isExpanded = expandedParents[parent.id]

        return (
          <div key={parent.id} className="bg-card border border-border rounded-lg p-2 shadow-sm transition-all overflow-hidden">
            <div 
              className={`flex items-center justify-between p-2 rounded-md ${hasChildren ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
              onClick={() => hasChildren && toggleExpand(parent.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 flex items-center justify-center text-muted-foreground">
                  {hasChildren ? (
                    isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  ) : (
                    <Tags className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="font-semibold">{parent.name}</span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <form action={async () => {
                  await deleteCategory(parent.id)
                }}>
                  <SubmitButton type="submit" pendingText="..." className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </SubmitButton>
                </form>
              </div>
            </div>
            
            {/* Render children */}
            {hasChildren && isExpanded && (
              <div className="mt-1 ml-9 space-y-1 pb-1 animate-in slide-in-from-top-2 duration-200">
                {parentChildren.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-sm font-medium text-foreground">{child.name}</span>
                    </div>
                    <form action={async () => {
                      await deleteCategory(child.id)
                    }}>
                      <SubmitButton type="submit" pendingText="..." className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </SubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
