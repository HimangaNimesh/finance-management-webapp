'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const handleClick = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('edit', txId)
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  return (
    <tr 
      onClick={handleClick} 
      className={`cursor-pointer ${className}`}
    >
      {children}
    </tr>
  )
}
