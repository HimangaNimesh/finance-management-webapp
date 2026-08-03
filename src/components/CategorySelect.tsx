'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Check } from 'lucide-react'

type Category = { 
  id: string
  name: string
  type: string
  parent_category_id?: string | null
}

export function CategorySelect({ 
  categories, 
  defaultValue,
  transactionType // 'income' | 'expense' | 'transfer'
}: { 
  categories: Category[] | null
  defaultValue?: string
  transactionType?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>(defaultValue || '')
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter categories by transaction type if provided, otherwise show all
  const filteredCategories = categories?.filter(c => {
    if (!transactionType || transactionType === 'transfer') return true
    return c.type === transactionType
  }) || []

  // Group categories
  const parentCategories = filteredCategories.filter(c => !c.parent_category_id)
  const childCategoriesByParent = filteredCategories.reduce((acc, cat) => {
    if (cat.parent_category_id) {
      if (!acc[cat.parent_category_id]) acc[cat.parent_category_id] = []
      acc[cat.parent_category_id].push(cat)
    }
    return acc
  }, {} as Record<string, Category[]>)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCategory = categories?.find(c => c.id === selectedId)

  const toggleExpand = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedParents(prev => ({ ...prev, [parentId]: !prev[parentId] }))
  }

  const selectCategory = (id: string) => {
    setSelectedId(id)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name="category_id" value={selectedId} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={selectedCategory ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedCategory ? `${selectedCategory.name} (${selectedCategory.type})` : 'None'}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-md max-h-60 overflow-y-auto">
          <div className="p-1">
            <button
              type="button"
              onClick={() => selectCategory('')}
              className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors ${!selectedId ? 'bg-muted/50 font-medium' : ''}`}
            >
              None
            </button>

            {parentCategories.map(parent => {
              const children = childCategoriesByParent[parent.id] || []
              const hasChildren = children.length > 0
              const isExpanded = expandedParents[parent.id]

              return (
                <div key={parent.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (hasChildren) {
                        toggleExpand(parent.id, e)
                      } else {
                        selectCategory(parent.id)
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors ${selectedId === parent.id ? 'bg-muted/50 font-medium' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      {hasChildren && (
                        <span className="text-muted-foreground w-4 flex justify-center">
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </span>
                      )}
                      {!hasChildren && <span className="w-4"></span>}
                      {parent.name}
                    </span>
                    {selectedId === parent.id && <Check className="w-4 h-4 text-primary" />}
                  </button>

                  {hasChildren && isExpanded && (
                    <div className="flex flex-col border-l-2 border-muted ml-4 pl-1 my-1">
                      {children.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => selectCategory(child.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors ${selectedId === child.id ? 'bg-muted/50 font-medium text-primary' : 'text-muted-foreground'}`}
                        >
                          <span>{child.name}</span>
                          {selectedId === child.id && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            
            {parentCategories.length === 0 && (
              <div className="px-2 py-3 text-sm text-center text-muted-foreground">
                No categories found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
