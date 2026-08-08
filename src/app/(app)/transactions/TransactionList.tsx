'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { Calendar, TrendingUp, TrendingDown, ArrowRightLeft, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { TransactionRowWrapper } from './TransactionRowWrapper'
import { DeleteTransactionButton } from './DeleteTransactionButton'
import { deleteTransaction, getMoreTransactions } from './actions'

type Transaction = any // Using any here to match existing implicit type behavior, we can refine if needed, but it works fine for now.

interface TransactionListProps {
  initialTransactions: Transaction[]
  currency: string
  accountId?: string
}

export function TransactionList({ initialTransactions, currency, accountId }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTransactions.length >= 50)
  
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset state if accountId or initialTransactions change completely (e.g. navigation)
    setTransactions(initialTransactions)
    setHasMore(initialTransactions.length >= 50)
  }, [initialTransactions])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, transactions.length])

  const loadMore = async () => {
    setLoading(true)
    try {
      const newTransactions = await getMoreTransactions(transactions.length, accountId)
      if (newTransactions.length === 0) {
        setHasMore(false)
      } else {
        setTransactions(prev => [...prev, ...newTransactions])
        if (newTransactions.length < 50) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Failed to load more transactions', error)
    } finally {
      setLoading(false)
    }
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = tx.transaction_date
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0, items: [] }
    }
    if (tx.type === 'income') acc[date].income += Number(tx.amount)
    if (tx.type === 'expense') acc[date].expense += Number(tx.amount)
    acc[date].items.push(tx)
    return acc
  }, {} as Record<string, { date: string, income: number, expense: number, items: Transaction[] }>)

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-hidden md:overflow-x-auto">
        <table className="min-w-full divide-y divide-border block md:table">
          <thead className="bg-muted/30 hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background block md:table-row-group">
            {sortedDates.map((date) => {
              const group = groupedTransactions[date]
              return (
                <Fragment key={date}>
                  <tr className="bg-muted/30 border-y border-border flex flex-col md:table-row">
                    <td colSpan={6} className="px-4 md:px-6 py-2.5 block md:table-cell w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(date)}
                        </div>
                        <div className="flex items-center w-full sm:w-auto gap-4 text-xs font-medium mt-1 sm:mt-0">
                          {group.income > 0 && (
                            <span className="text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                              <TrendingUp className="w-3 h-3" /> {formatCurrency(group.income, currency)}
                            </span>
                          )}
                          {group.expense > 0 && (
                            <span className="text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full ml-auto sm:ml-0">
                              <TrendingDown className="w-3 h-3" /> {formatCurrency(group.expense, currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {group.items.map((tx: any) => (
                    <TransactionRowWrapper key={tx.id} txId={tx.id} className="hover:bg-muted/10 transition-colors flex flex-row items-center p-3 md:p-0 md:table-row border-b border-border md:border-0 last:border-0">
                      <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-muted-foreground/50">
                        {/* Date is shown in header */}
                      </td>
                      
                      <td className="w-1/4 md:w-auto px-1 md:px-6 py-1 md:py-3 whitespace-nowrap text-sm text-muted-foreground order-1 md:order-none block md:table-cell">
                        <div className="flex items-center gap-1 truncate">
                          <span className="md:hidden shrink-0">
                            {tx.type === 'expense' && <TrendingDown className="w-3 h-3 text-destructive" />}
                            {tx.type === 'income' && <TrendingUp className="w-3 h-3 text-success" />}
                            {tx.type === 'transfer' && <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />}
                          </span>
                          <span className="truncate">
                            {tx.type === 'transfer' ? `To: ${tx.to_account?.name || 'Unknown'}` : (tx.category?.name || '-')}
                          </span>
                        </div>
                      </td>

                      <td className="flex-1 px-2 md:px-6 py-1 md:py-3 text-sm text-foreground order-2 md:order-none block md:table-cell min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                          <div className="hidden md:flex items-center gap-2">
                            {tx.type === 'expense' && <TrendingDown className="w-4 h-4 text-destructive shrink-0" />}
                            {tx.type === 'income' && <TrendingUp className="w-4 h-4 text-success shrink-0" />}
                            {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4 text-muted-foreground shrink-0" />}
                          </div>
                          <span className="font-medium truncate block">{tx.note || 'No description'}</span>
                          <span className="text-xs text-muted-foreground block md:hidden truncate">
                            {tx.type === 'transfer' ? `${tx.account?.name} → ${tx.to_account?.name}` : (tx.account?.name || '-')}
                          </span>
                        </div>
                      </td>
                      
                      <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                        {tx.type === 'transfer' ? `${tx.account?.name} → ${tx.to_account?.name}` : (tx.account?.name || '-')}
                      </td>
                      
                      <td className={`px-2 md:px-6 py-1 md:py-3 whitespace-nowrap text-sm font-medium text-right order-3 md:order-none block md:table-cell shrink-0 ${
                        tx.type === 'expense' ? 'text-destructive' : tx.type === 'income' ? 'text-success' : 'text-foreground'
                      }`}>
                        {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                      
                      <td className="px-0 md:px-6 py-1 md:py-3 whitespace-nowrap text-right text-sm font-medium order-4 md:order-none block md:table-cell shrink-0">
                        <DeleteTransactionButton id={tx.id} deleteAction={deleteTransaction} />
                      </td>
                    </TransactionRowWrapper>
                  ))}
                </Fragment>
              )
            })}
            {sortedDates.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground block md:table-cell">
                  No transactions found.
                </td>
              </tr>
            )}
            
            {hasMore && (
              <tr className="block md:table-row">
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground block md:table-cell">
                  <div ref={observerTarget} className="flex flex-col items-center justify-center gap-3">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <span className="text-sm">Loading more...</span>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
