'use client'

import NextTopLoader from 'nextjs-toploader'
import { useEffect, useState } from 'react'

export function TopLoader() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <NextTopLoader color="#4f46e5" showSpinner={false} />
}
