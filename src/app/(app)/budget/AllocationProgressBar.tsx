'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { EditAllocationModal } from './EditAllocationModal'
import { DeleteAllocationButton } from './DeleteAllocationButton'

type BreakdownItem = {
  id: string
  name: string
  amount: number
  colorClass: string
}

type Props = {
  allocation: {
    id: string
    budget_period_id: string
    category_id: string
    category_name: string
    allocated_amount: number
    spent_amount: number
  }
  breakdown: BreakdownItem[]
  currency: string
}

export function AllocationProgressBar({ allocation, breakdown, currency }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const allocated = Number(allocation.allocated_amount)
  const spent = Number(allocation.spent_amount)
  const remaining = allocated - spent
  const percentage = allocated > 0 ? Math.min(100, Math.max(0, (spent / allocated) * 100)) : 0
  const isOver = spent > allocated

  // We need to render segments as percentages of the allocated amount
  // If we are over budget, the total width is spent, else it's allocated
  const scaleBase = isOver ? spent : allocated

  return (
    <div className="space-y-2 group bg-background/30 rounded-lg p-3 -mx-3 transition-colors hover:bg-muted/30 relative">
      <div 
        className="flex justify-between items-end cursor-pointer select-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{allocation.category_name || 'Unknown Category'}</span>
          {breakdown.length > 0 && (
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-2">
            <EditAllocationModal allocation={allocation} />
            <DeleteAllocationButton id={allocation.id} />
          </div>
        </div>
        <div className="text-right text-sm">
          <span className={isOver ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
            {formatCurrency(spent, currency)} spent
          </span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="font-medium">{formatCurrency(allocated, currency)}</span>
        </div>
      </div>
      
      <div 
        className={`w-full bg-secondary h-2.5 rounded-full overflow-hidden flex ${breakdown.length > 0 ? 'cursor-pointer' : ''}`}
        onClick={() => breakdown.length > 0 && setIsExpanded(!isExpanded)}
      >
        {isOver ? (
          <div className="h-full rounded-full bg-destructive w-full" />
        ) : (
          breakdown.map((item, index) => {
            const itemPercentage = scaleBase > 0 ? (item.amount / scaleBase) * 100 : 0
            if (itemPercentage <= 0) return null
            return (
              <div 
                key={item.id}
                className={`h-full ${item.colorClass} ${index === 0 ? 'rounded-l-full' : ''} ${index === breakdown.length - 1 && percentage >= 100 ? 'rounded-r-full' : ''}`}
                style={{ width: `${itemPercentage}%` }}
                title={`${item.name}: ${formatCurrency(item.amount, currency)}`}
              />
            )
          })
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs">
        {isOver ? (
          <span className="text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Over budget by {formatCurrency(Math.abs(remaining), currency)}
          </span>
        ) : (
          <span className="text-success">{formatCurrency(remaining, currency)} remaining</span>
        )}
        <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
      </div>

      {isExpanded && breakdown.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
          {breakdown.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOver ? 'bg-destructive' : item.colorClass}`} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <div className="text-foreground font-medium">
                {formatCurrency(item.amount, currency)}
                <span className="text-muted-foreground text-xs ml-2 w-10 inline-block text-right">
                  {allocated > 0 ? Math.round((item.amount / allocated) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
