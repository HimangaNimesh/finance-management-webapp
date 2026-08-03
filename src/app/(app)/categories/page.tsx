import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { AddCategoryModal } from './AddCategoryModal'
import { CategoryList } from './CategoryList'

export default async function CategoriesPage() {
  const { workspaceId } = await getActiveWorkspace()
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  const incomeCategories = categories?.filter(c => c.type === 'income') || []
  const expenseCategories = categories?.filter(c => c.type === 'expense') || []



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-2">Manage your income and expense categories.</p>
        </div>
        <AddCategoryModal categories={categories} />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Expense Categories</h2>
          <CategoryList categories={expenseCategories} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Income Categories</h2>
          <CategoryList categories={incomeCategories} />
        </div>
      </div>
    </div>
  )
}
