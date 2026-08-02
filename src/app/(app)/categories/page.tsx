import { createClient } from '@/utils/supabase/server'
import { getActiveWorkspace } from '@/utils/workspace'
import { addCategory, deleteCategory } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Tags, Trash2, Plus, ArrowRight } from 'lucide-react'

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

  const renderCategoryList = (list: typeof categories) => {
    if (!list || list.length === 0) {
      return (
        <div className="text-center p-8 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )
    }

    // group by parent
    const parents = list.filter(c => !c.parent_category_id)
    const children = list.filter(c => c.parent_category_id)

    return (
      <div className="space-y-3">
        {parents.map(parent => (
          <div key={parent.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tags className="w-5 h-5 text-primary" />
                <span className="font-semibold">{parent.name}</span>
              </div>
              <form action={async () => {
                'use server'
                await deleteCategory(parent.id)
              }}>
                <button type="submit" className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
            
            {/* Render children */}
            {children.filter(c => c.parent_category_id === parent.id).map(child => (
              <div key={child.id} className="mt-2 ml-8 flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{child.name}</span>
                </div>
                <form action={async () => {
                  'use server'
                  await deleteCategory(child.id)
                }}>
                  <SubmitButton type="submit" className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-2">Manage your income and expense categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Expense Categories</h2>
            {renderCategoryList(expenseCategories)}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Income Categories</h2>
            {renderCategoryList(incomeCategories)}
          </div>
        </div>

        <div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Category</h2>
            <form action={addCategory} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input type="text" id="name" name="name" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Groceries" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select id="type" name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label htmlFor="parent_category_id" className="block text-sm font-medium text-foreground mb-1">Parent Category (Optional)</label>
                <select id="parent_category_id" name="parent_category_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">None (Top Level)</option>
                  {categories?.filter(c => !c.parent_category_id).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
              <SubmitButton type="submit" pendingText="Adding..." className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 px-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
