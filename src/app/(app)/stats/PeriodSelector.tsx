'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

type Period = {
  id: string
  label: string
  is_active: boolean
}

export function PeriodSelector({ periods, currentPeriodId }: { periods: Period[], currentPeriodId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriodId = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodId', newPeriodId)
    router.push(`/stats?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-lg shadow-sm">
      <Calendar className="w-5 h-5 text-muted-foreground ml-2" />
      <select 
        name="periodId"
        value={currentPeriodId}
        onChange={handlePeriodChange}
        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer pr-8"
      >
        {periods.map(p => (
          <option key={p.id} value={p.id}>
            {p.label} {p.is_active ? '(Active)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
