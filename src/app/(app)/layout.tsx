import { Navigation } from '@/components/Navigation'
import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { redirect } from 'next/navigation'
import { TransactionModals } from './transactions/TransactionModals'

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

  // Fetch active workspace ID
  const { workspaceId: activeWorkspaceId } = await getActiveWorkspace()

  // Fetch all workspaces the user belongs to
  const { data: members } = await supabase
    .from('workspace_members')
    .select('workspaces(id, name)')
    .eq('user_id', user.id)
    .order('role', { ascending: false })

  const workspaces = members?.map(m => ({
    // @ts-ignore
    id: m.workspaces.id,
    // @ts-ignore
    name: m.workspaces.name
  })) || []

  // Fetch data for global FAB transaction modal
  const { data: accounts } = await supabase.from('accounts').select('id, name').eq('workspace_id', activeWorkspaceId)
  const { data: categories } = await supabase.from('categories').select('id, name, type, parent_category_id').eq('workspace_id', activeWorkspaceId)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation 
        userName={fullName} 
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />
      <main className="flex-1 p-4 md:p-8 w-full relative">
        <div className="mx-auto max-w-7xl pb-12 md:pb-0">
          {children}
        </div>
        
        {/* Global Floating Action Button */}
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40">
          <TransactionModals accounts={accounts} categories={categories} isFab={true} />
        </div>
      </main>
    </div>
  )
}
