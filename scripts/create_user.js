/**
 * Script simples para criar um usuário no Supabase usando a Service Role Key.
 * Uso (executar localmente, NÃO commit sua service key):
 *
 * NEXT_PUBLIC_SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
 *   node scripts/create_user.js usuario@exemplo.com SenhaForte123!
 *
 * Observação: este script roda localmente e utiliza a Service Role Key que nunca deve
 * ser colocada em código público ou no client.
 */

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Erro: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const admin = createClient(url, key)

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('Uso: node scripts/create_user.js usuario@exemplo.com SenhaForte123!')
  process.exit(1)
}

async function main() {
  try {
    // supabase-js v2: admin.auth.admin.createUser
    const res = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    console.log('Usuário criado com sucesso:')
    console.log(res)
  } catch (err) {
    console.error('Erro ao criar usuário:', err)
    process.exit(1)
  }
}

main()
