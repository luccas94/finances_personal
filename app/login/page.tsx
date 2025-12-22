 'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnon)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) {
      console.error('Login error', res.error)
      setMsg(res.error.message || JSON.stringify(res.error))
      setLoading(false)
    } else {
      setMsg('Login realizado. Redirecionando...')
      // small delay to show message then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 400)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded flex items-center justify-center text-white font-bold">FC</div>
            <div>
              <h1 className="text-2xl font-bold">Finanças do Casal</h1>
              <p className="text-sm text-gray-500">Entre com seu e-mail para continuar</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="text-xs text-gray-600">E-mail</label>
            <input className="border p-3 rounded-md shadow-sm" placeholder="seu@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />

            <label className="text-xs text-gray-600">Senha</label>
            <input className="border p-3 rounded-md shadow-sm" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <button className="bg-teal-600 text-white p-3 rounded-md font-medium">Entrar</button>
          </form>

          {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}

          <p className="mt-4 text-xs text-gray-400">Projeto pessoal — evite usar senhas sensíveis em ambientes de teste.</p>
        </div>
      </div>
    </div>
  )
}
