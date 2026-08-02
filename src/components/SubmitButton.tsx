'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  pendingText?: string;
}

export function SubmitButton({ children, pendingText, className, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      disabled={pending || disabled}
      className={`${className} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
          {pendingText || children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
