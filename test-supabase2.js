import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ngyzfzqfwwgasuwgjgvx.supabase.co'
const supabaseKey = 'sb_publishable_0KkE4Ua4KaPxZ0GKXG7WVw__-9IUhwp'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: insertData, error: insertError } = await supabase.from('sales').insert([{
    date: '2026-06-30',
    amount: 10,
    paymentMethod: 'CB',
    clientName: 'Client',
    description: 'Vente',
    orderNumber: '-'
  }]).select()
  console.log('Insert result with fields:', insertData, insertError)
  
  if (insertData) {
    await supabase.from('sales').delete().eq('id', insertData[0].id)
  }
}

test()
