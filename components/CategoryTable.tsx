"use client"
import { useState, useEffect } from 'react'

type Item = {
  id: string
  categoria: string | null
  subcategoria: string | null
  descricao?: string | null
  valor: number
  data?: string | null
  estabelecimento?: string | null
}

import supabase from '../lib/supabaseClient'

// fallback static mapping (kept for compatibility) — dynamic data from DB will override when available
const STATIC_CATEGORIES: Record<string, string[]> = {
  'ALIMENTAÇÃO': ['IFOOD','MERCADO','RESTAURANTES','BARES'],
  'LAZER': ['TABACO/SEDA','DISTRIBUIDORA'],
  'CARRO': ['COMBUSTIVEL','MANUTENÇÃO','ESTACIONAMENTO','LAVA CAR'],
  'PIX NO CREDITO': ['PICPAY'],
  'CUIDADOS PESSOAIS': ['UNHA','CABELO','CILIOS'],
  'DIVERSOS': ['SHOPEE','MERCADO LIVRE','COMPRAS GERAIS']
}

export default function CategoryTable({ items }: { items: Item[] }){
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [catMap, setCatMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function loadCats(){
      try{
        const { data, error } = await supabase.from('categorias').select('id,nome,parent_id')
        if (error) throw error
        const rows = (data||[]) as Array<{id:number,nome:string,parent_id:number|null}>
        const parents = rows.filter(r=>r.parent_id===null)
        const map: Record<string,string[]> = {}
        parents.forEach(p => {
          const subs = rows.filter(s => s.parent_id === p.id).map(s => s.nome.toUpperCase())
          map[p.nome.toUpperCase()] = subs
        })
        setCatMap(map)
      }catch(err){
        // silent fail — keep static mapping
        console.error('failed to load categories', err)
      }
    }
    loadCats()
  }, [])

  // compute totals
  const totalsByCategory: Record<string, number> = {}
  const detailsByCategory: Record<string, Item[]> = {}

  items.forEach(it => {
    const cat = (it.categoria || 'Sem categoria').toUpperCase()
    totalsByCategory[cat] = (totalsByCategory[cat] || 0) + Number(it.valor || 0)
    detailsByCategory[cat] = detailsByCategory[cat] || []
    detailsByCategory[cat].push(it)
  })

  const knownParents = new Set([...Object.keys(STATIC_CATEGORIES), ...Object.keys(catMap)])
  const categories = Array.from(new Set([...Array.from(knownParents), ...Object.keys(totalsByCategory)]))

  return (
    <div className="space-y-3">
      {categories.map(cat => {
        const total = totalsByCategory[cat] ?? 0
        const subcats = catMap[cat] ?? STATIC_CATEGORIES[cat] ?? []
        return (
          <div key={cat} className="card">
              <div className="collapse-header">
              <div>
                <div className="font-semibold">{cat}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold">R$ {total.toFixed(2)}</div>
                  <button className="btn-ghost" onClick={() => setOpen(prev => ({...prev, [cat]: !prev[cat]}))} aria-expanded={!!open[cat]}>
                    <span className={`chev ${open[cat] ? 'open' : ''}`}>▾</span>
                  </button>
              </div>
            </div>
            {open[cat] && (
              <div className="mt-3 border-t pt-3 overflow-x-auto">
                <table className="w-full text-left table-fixed">
                  <colgroup>
                    <col style={{width: '90px'}} />
                    <col />
                    <col style={{width: '96px'}} />
                  </colgroup>
                  <thead>
                    <tr className="text-sm muted">
                      <th className="px-2">Data</th>
                      <th className="px-2">Descrição</th>
                      <th className="px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailsByCategory[cat]||[]).map(row => (
                      <tr key={row.id} className="align-top border-b last:border-b-0">
                        <td className="py-1 px-2 text-sm muted whitespace-nowrap">{row.data ?? '-'}</td>
                        <td className="py-1 px-2 text-sm muted truncate overflow-hidden whitespace-nowrap">{row.descricao ?? ''} {row.subcategoria ? `· ${row.subcategoria}` : ''}</td>
                        <td className="py-1 px-2 text-sm text-right whitespace-nowrap">R$ {Number(row.valor || 0).toFixed(2)}</td>
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
