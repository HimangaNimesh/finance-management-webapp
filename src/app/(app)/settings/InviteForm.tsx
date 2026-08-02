'use client'

import { useState } from 'react'
import { inviteMember } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

export function InviteForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function action(formData: FormData) {
    setError(null)
    setSuccess(null)
    const result = await inviteMember(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('User added successfully!')
      const emailInput = document.getElementById('email') as HTMLInputElement
      if (emailInput) emailInput.value = ''
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email address</label>
          <input type="email" id="email" name="email" required placeholder="their@email.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <SubmitButton type="submit" pendingText="Sending..." className="bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Send Invite
        </SubmitButton>
      </div>
      
      {error && (
        <div className="text-sm text-destructive flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-success flex items-center gap-2 p-2 bg-success/10 rounded-md">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}
    </form>
  )
}
