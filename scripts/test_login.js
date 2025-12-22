/**
 * Test login using client (anon) key.
 * Uso:
 *   node scripts/test_login.js usuario@exemplo.com SenhaForte123!
 * Defina as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]
if (!email || !password) {
  console.log('Uso: node scripts/test_login.js usuario@exemplo.com SenhaForte123!')
  process.exit(1)
}

const supabase = createClient(url, anon)

async function main() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Erro no login:', error)
      process.exit(1)
    }
    console.log('Login OK — user session:')
    console.log(data)
  } catch (err) {
    console.error('Erro inesperado:', err)
    process.exit(1)
  }
}

main()
