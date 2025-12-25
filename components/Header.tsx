"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import supabase from '../lib/supabaseClient'

export default function Header(){
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('Bom dia,')

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 5 && h < 12) setGreeting('Bom dia,')
    else if (h >= 12 && h < 18) setGreeting('Boa tarde,')
    else setGreeting('Boa noite,')
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(async (res) => {
      if (!mounted) return
      const u = res?.data?.user ?? null
      setUser(u)
      try{
        if(u){
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', u.id).single()
          setFullName(profile?.full_name ?? null)
        } else {
          setFullName(null)
        }
      }catch(_){ setFullName(null) }
    }).catch(() => {})

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if(!u){ setFullName(null); return }
      supabase.from('profiles').select('full_name').eq('id', u.id).single()
        .then(({data: profile})=> setFullName(profile?.full_name ?? null))
        .catch(()=>{})
    })

    return () => {
      mounted = false
      try { (data as any)?.subscription?.unsubscribe?.() } catch (_) {}
    }
  }, [])

  // adjust theme color based on logged user name
  useEffect(() => {
    try {
      const meta:any = (user as any)?.user_metadata || {}
      const nm = (fullName || meta.full_name || user?.email?.split('@')[0] || '').toString().toLowerCase()
      let colorMain = '#10b981' // default green
      let colorSec = '#059d97'
      if (nm.includes('milen')) { colorMain = '#ec4899'; colorSec = '#db2777' } // pink shades
      if (nm.includes('lucas')) { colorMain = '#10b981'; colorSec = '#059d97' } // green shades
      document?.documentElement?.style?.setProperty('--accent', colorMain)
      document?.documentElement?.style?.setProperty('--accent-2', colorSec)
    } catch (_){ }
  }, [user, fullName])

  if (pathname === '/login' || !user) return null

  const meta:any = (user as any)?.user_metadata || {}
  const name = fullName || meta.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initial = name ? name.charAt(0).toUpperCase() : 'U'


  return (
    <header className="topbar">
      <div className="inner container">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="avatar">{initial}</div>
          <div>
            <div style={{fontSize:12,opacity:0.95}}>{greeting}</div>
            <div className="title" style={{fontWeight:800,fontSize:16}}>{name}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Link href="/despesas/nova" className="back">＋</Link>
        </div>
      </div>
    </header>
  )
}
