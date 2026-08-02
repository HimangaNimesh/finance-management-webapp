'use server'

import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { revalidatePath } from 'next/cache'

export async function addCategory(formData: FormData) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const parent_category_id = formData.get('parent_category_id') as string || null

  const { error } = await supabase.from('categories').insert({
    workspace_id: workspaceId,
    name,
    type,
    parent_category_id,
  })

  if (error) {
    throw new Error('Failed to create category: ' + error.message)
  }

  revalidatePath('/categories')
}

export async function deleteCategory(categoryId: string) {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw new Error('Failed to delete category: ' + error.message)
  }

  revalidatePath('/categories')
}
