import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ngyzfzqfwwgasuwgjgvx.supabase.co'
const supabaseKey = 'sb_publishable_0KkE4Ua4KaPxZ0GKXG7WVw__-9IUhwp'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('sales').select('*')
  console.log('Select result:', data, error)

  const { data: insertData, error: insertError } = await supabase.from('sales').insert([{
    date: '2026-06-30',
    amount: 10,
    paymentMethod: 'CB'
  }]).select()
  console.log('Insert result without clientName:', insertData, insertError)
}

test()
