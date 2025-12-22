'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import supabase from '../lib/supabaseClient'

export default function Header(){
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(res => {
      if (!mounted) return
      setUser(res?.data?.user ?? null)
    }).catch(() => {})

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      try { (data as any)?.subscription?.unsubscribe?.() } catch (_) {}
    }
  }, [])

  if (pathname === '/login' || !user) return null

  return (
    <header className="topbar">
      <div className="inner container">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Link href="/dashboard" className="back">◀</Link>
        </div>
        <div style={{textAlign:'center'}}>
          <div className="title">Finanças <span className="muted">Casal</span></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Link href="/despesas/nova" className="back">＋</Link>
        </div>
      </div>
    </header>
  )
}
