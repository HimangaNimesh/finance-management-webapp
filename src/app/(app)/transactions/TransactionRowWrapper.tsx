'use client'
import { useRouter } from 'next/navigation'

export function TransactionRowWrapper({ 
  children, 
  txId, 
  className 
}: { 
  children: React.ReactNode, 
  txId: string, 
  className?: string 
}) {
  const router = useRouter()
  
  return (
    <tr 
      onClick={() => router.push(`?edit=${txId}`, { scroll: false })} 
      className={`cursor-pointer ${className}`}
    >
      {children}
    </tr>
  )
}
