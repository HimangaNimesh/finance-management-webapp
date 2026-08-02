import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getActiveWorkspace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's workspaces
  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, currency)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (error || !members) {
    // If no workspace found, they might need to wait for the trigger or something went wrong.
    throw new Error('No workspace found for user.')
  }

  return {
    workspaceId: members.workspace_id,
    // @ts-ignore
    workspaceName: members.workspaces?.name as string,
    // @ts-ignore
    currency: (members.workspaces?.currency as string) || 'USD'
  }
}
