import { Navigation } from '@/components/Navigation'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const fullName = user.user_metadata?.full_name || user.email

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      <Navigation userName={fullName} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl animate-fade-in pb-12 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  )
}
