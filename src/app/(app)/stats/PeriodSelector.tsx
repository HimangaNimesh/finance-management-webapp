'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

type Period = {
  id: string
  label: string
  is_active: boolean
}

export function PeriodSelector({ periods, currentPeriodId }: { periods: Period[], currentPeriodId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentIndex = periods.findIndex(p => p.id === currentPeriodId)
  
  // periods are sorted newest first, so previous period in time is index + 1
  const prevPeriod = currentIndex < periods.length - 1 ? periods[currentIndex + 1] : null
  const nextPeriod = currentIndex > 0 ? periods[currentIndex - 1] : null
  
  const currentPeriod = periods[currentIndex]

  const navigateToPeriod = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodId', id)
    router.push(`/stats?${params.toString()}`)
  }

  if (!currentPeriod) return null

  return (
    <div className="flex items-center justify-between w-full bg-card border border-border p-1.5 rounded-lg shadow-sm">
      <button 
        onClick={() => prevPeriod && navigateToPeriod(prevPeriod.id)}
        disabled={!prevPeriod}
        className="p-1.5 shrink-0 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center justify-center gap-2 px-2 min-w-[140px] overflow-hidden">
        <Calendar className="w-4 h-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium whitespace-nowrap truncate">
          {currentPeriod.label} {currentPeriod.is_active ? '(Active)' : ''}
        </span>
      </div>

      <button 
        onClick={() => nextPeriod && navigateToPeriod(nextPeriod.id)}
        disabled={!nextPeriod}
        className="p-1.5 shrink-0 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
