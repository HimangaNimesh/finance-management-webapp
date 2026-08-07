import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function getActiveWorkspace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's workspaces
  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, currency, transfer_fee_amount)')
    .eq('user_id', user.id)
    .order('role', { ascending: false }) // 'owner' comes before 'member'

  if (error || !members || members.length === 0) {
    throw new Error('No workspace found for user.')
  }

  const cookieStore = await cookies()
  const activeWorkspaceId = cookieStore.get('active_workspace_id')?.value

  let activeMember = members[0] // fallback to highest role workspace

  if (activeWorkspaceId) {
    const found = members.find(m => m.workspace_id === activeWorkspaceId)
    if (found) {
      activeMember = found
    }
  }

  return {
    workspaceId: activeMember.workspace_id,
    // @ts-ignore
    workspaceName: activeMember.workspaces?.name as string,
    // @ts-ignore
    currency: (activeMember.workspaces?.currency as string) || 'USD',
    // @ts-ignore
    transferFeeAmount: (activeMember.workspaces?.transfer_fee_amount as number) || 0
  }
}
