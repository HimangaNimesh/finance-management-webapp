'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ChartData = {
  name: string
  value: number
  color: string
}

const COLORS = [
  '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', 
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
]

export function StatsChart({ 
  expenseData, 
  incomeData,
  currency 
}: { 
  expenseData: ChartData[]
  incomeData: ChartData[]
  currency: string
}) {
  const [view, setView] = useState<'expense' | 'income'>('expense')

  const currentData = view === 'expense' ? expenseData : incomeData
  const total = currentData.reduce((sum, item) => sum + item.value, 0)

  // Format currency for tooltip
  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value)
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Spending by Category</h3>
        
        <div className="flex bg-muted rounded-md p-1">
          <button
            onClick={() => setView('expense')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'expense' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setView('income')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'income' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Incomes
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col min-h-0">
        {currentData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No data available for this period.</p>
          </div>
        ) : (
          <>
            <div className="mb-2 text-center sm:text-left shrink-0">
              <p className="text-sm text-muted-foreground capitalize">Total {view}</p>
              <p className="text-2xl font-bold text-foreground">{formatTooltip(total)}</p>
            </div>
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={0}
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatTooltip(Number(value)), 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
