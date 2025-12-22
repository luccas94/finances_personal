"use client"
import { useState } from 'react'

type Item = {
  id: string
  categoria: string | null
  subcategoria: string | null
  descricao?: string | null
  valor: number
  data?: string | null
  estabelecimento?: string | null
}

const CATEGORIES: Record<string, string[]> = {
  'ALIMENTAÇÃO': ['IFOOD','MERCADO','RESTAURANTES','BARES'],
  'LAZER': ['TABACO/SEDA','DISTRIBUIDORA'],
  'CARRO': ['COMBUSTIVEL','MANUTENÇÃO','ESTACIONAMENTO','LAVA CAR'],
  'PIX NO CREDITO': ['PICPAY'],
  'CUIDADOS PESSOAIS': ['UNHA','CABELO','CILIOS'],
  'DIVERSOS': ['SHOPEE','MERCADO LIVRE','COMPRAS GERAIS']
}

export default function CategoryTable({ items }: { items: Item[] }){
  const [open, setOpen] = useState<Record<string, boolean>>({})

  // compute totals
  const totalsByCategory: Record<string, number> = {}
  const detailsByCategory: Record<string, Item[]> = {}

  items.forEach(it => {
    const cat = (it.categoria || 'Sem categoria').toUpperCase()
    totalsByCategory[cat] = (totalsByCategory[cat] || 0) + Number(it.valor || 0)
    detailsByCategory[cat] = detailsByCategory[cat] || []
    detailsByCategory[cat].push(it)
  })

  const categories = Object.keys(CATEGORIES).concat(Object.keys(totalsByCategory).filter(c=>!Object.keys(CATEGORIES).includes(c)))

  return (
    <div className="space-y-3">
      {categories.map(cat => {
        const total = totalsByCategory[cat] ?? 0
        const subcats = CATEGORIES[cat] ?? []
        return (
          <div key={cat} className="card">
              <div className="collapse-header">
              <div>
                <div className="font-semibold">{cat}</div>
                {subcats.length>0 && <div className="text-sm muted">{subcats.join(' • ')}</div>}
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold">R$ {total.toFixed(2)}</div>
                  <button className="btn-ghost" onClick={() => setOpen(prev => ({...prev, [cat]: !prev[cat]}))} aria-expanded={!!open[cat]}>
                    <span className={`chev ${open[cat] ? 'open' : ''}`}>▾</span>
                  </button>
              </div>
            </div>
            {open[cat] && (
              <div className="mt-3 border-t pt-3">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm muted">
                      <th>Data</th>
                      <th>Estabelecimento</th>
                      <th>Descrição</th>
                      <th className="text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailsByCategory[cat]||[]).map(row => (
                      <tr key={row.id} className="align-top border-b last:border-b-0">
                        <td className="py-2 text-sm muted">{row.data ?? '-'}</td>
                        <td className="py-2 text-sm">{row.estabelecimento ?? '-'}</td>
                        <td className="py-2 text-sm muted">{row.descricao ?? ''} {row.subcategoria ? `· ${row.subcategoria}` : ''}</td>
                        <td className="py-2 text-sm text-right">R$ {Number(row.valor || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
