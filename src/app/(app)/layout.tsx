import { Navigation } from '@/components/Navigation'
import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation 
        userName={fullName} 
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />
      <main className="flex-1 p-4 md:p-8 w-full">
        <div className="mx-auto max-w-7xl pb-12 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  )
}
