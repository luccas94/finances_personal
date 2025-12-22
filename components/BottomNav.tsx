"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav(){
  const pathname = usePathname()
  return (
    <div className="bottom-nav">
      <nav className="bar">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>🏠</Link>
        <Link href="/despesas/nova" className={pathname?.startsWith('/despesas') ? 'active' : ''}>📷</Link>
        <Link href="/despesas/importar-fatura" className={pathname === '/despesas/importar-fatura' ? 'active' : ''}>📄</Link>
      </nav>
    </div>
  )
}
