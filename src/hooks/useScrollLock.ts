'use client'

import { useEffect } from 'react'

export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isOpen) {
      document.body.classList.add('scroll-locked')
    } else {
      document.body.classList.remove('scroll-locked')
    }

    return () => {
      document.body.classList.remove('scroll-locked')
    }
  }, [isOpen])
}
