'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { switchWorkspace } from '@/app/(app)/workspace-actions'

export type Workspace = {
  id: string
  name: string
}

type Props = {
  workspaces: Workspace[]
  activeWorkspaceId: string
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (workspaceId: string) => {
    if (workspaceId === activeWorkspaceId) {
      setIsOpen(false)
      return
    }
    
    startTransition(async () => {
      await switchWorkspace(workspaceId)
      setIsOpen(false)
    })
  }

  if (workspaces.length <= 1) {
    return null // Don't show switcher if they only have 1 workspace
  }

  return (
    <div className="relative mb-6" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 hover:bg-muted/80 border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        <span className="truncate">{activeWorkspace.name}</span>
        {isPending ? (
          <Loader2 className="w-4 h-4 shrink-0 text-muted-foreground animate-spin" />
        ) : (
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSelect(ws.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors ${
                  ws.id === activeWorkspaceId ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                }`}
              >
                <span className="truncate pr-2">{ws.name}</span>
                {ws.id === activeWorkspaceId && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
