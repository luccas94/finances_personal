import './globals.css'
import { ReactNode } from 'react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export const metadata = {
  title: 'Finanças Pessoal',
  description: 'Controle de despesas do casal'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-iphone text-iphone-900">
        <div className="safe-area">
          <Header />
          <main className="container py-6">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
