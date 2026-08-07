import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('Fetching all workspaces...')
  const { data: workspaces, error: wsError } = await supabase.from('workspaces').select('id, transfer_fee_amount')
  if (wsError) throw wsError

  for (const workspace of workspaces) {
    console.log(`Processing workspace ${workspace.id} (fee: ${workspace.transfer_fee_amount})`)
    if (!workspace.transfer_fee_amount || workspace.transfer_fee_amount <= 0) continue

    const { data: transfers, error: txError } = await supabase
      .from('transactions')
      .select('id, account_id, to_account_id, transaction_date, created_by, account:accounts!transactions_account_id_fkey(name), to_account:accounts!transactions_to_account_id_fkey(name)')
      .eq('workspace_id', workspace.id)
      .eq('type', 'transfer')
      .not('to_account_id', 'is', null)

    if (txError) throw txError
    console.log(`Found ${transfers.length} transfers`)

    for (const tx of transfers) {
      // @ts-ignore
      const fromName = tx.account?.name
      // @ts-ignore
      const toName = tx.to_account?.name

      if (fromName === 'HNB Main' && toName === 'HNB debit card') {
        console.log(`Skipping transfer ${tx.id} (exempted)`)
        continue
      }

      // Check if fee already exists
      const { data: existingFee } = await supabase
        .from('transactions')
        .select('id')
        .eq('linked_transaction_id', tx.id)
        .maybeSingle()

      if (existingFee) {
        console.log(`Fee already exists for transfer ${tx.id}`)
        continue
      }

      console.log(`Applying fee for transfer ${tx.id}...`)
      const { error: insertError } = await supabase.from('transactions').insert({
        workspace_id: workspace.id,
        account_id: tx.account_id,
        type: 'expense',
        amount: workspace.transfer_fee_amount,
        transaction_date: tx.transaction_date,
        note: 'Bank Transfer Fee',
        linked_transaction_id: tx.id,
        created_by: tx.created_by
      })

      if (insertError) {
        console.error(`Failed to apply fee to ${tx.id}:`, insertError)
      } else {
        console.log(`Successfully applied fee to ${tx.id}`)
      }
    }
  }
}

main().catch(console.error)
