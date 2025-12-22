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
  const [subOpen, setSubOpen] = useState<Record<string, Record<string, boolean>>>({})
  const [catMap, setCatMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function loadCats(){
      try{
        const { data, error } = await supabase.from('categorias').select('id,nome,parent_id')
        if (error) throw error
        const rows = (data||[]) as Array<{id:number,nome:string,parent_id:number|null}>
        const parents = rows.filter(r=>r.parent_id===null)
        const map: Record<string,string[]> = {}
        const reverse: Record<string,string> = {}
        parents.forEach(p => {
          const subs = rows.filter(s => s.parent_id === p.id).map(s => {
            const upper = s.nome.toUpperCase()
            reverse[upper] = p.nome.toUpperCase()
            return upper
          })
          map[p.nome.toUpperCase()] = subs
        })
        setCatMap(map)
        // attach reverse map to window for use in grouping logic (small hack without changing state types)
        ;(window as any).__CAT_REVERSE__ = reverse
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
    let cat = (it.categoria || 'Sem categoria').toUpperCase()
    // if the stored `categoria` is actually a subcategory, map it to its parent when possible
    const reverse = (window as any).__CAT_REVERSE__ as Record<string,string> | undefined
    if (reverse && !Object.keys(STATIC_CATEGORIES).map(k=>k.toUpperCase()).includes(cat)){
      const mapped = reverse[cat]
      if (mapped) cat = mapped
    }
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
              <div className="mt-3 border-t pt-3">
                {/* Group by subcategory */}
                {(() => {
                  const rows = detailsByCategory[cat] || []
                  const subTotals: Record<string, number> = {}
                  const subDetails: Record<string, Item[]> = {}
                  rows.forEach(r => {
                    // prefer explicit subcategoria; otherwise if categoria value is actually a subcategory, use it
                    let sub: string | null = r.subcategoria ? r.subcategoria.toString() : null
                    if (!sub){
                      const catVal = (r.categoria || '').toString().toUpperCase()
                      const reverse = (window as any).__CAT_REVERSE__ as Record<string,string> | undefined
                      if (reverse && reverse[catVal]){
                        sub = r.categoria?.toString() || 'Sem subcategoria'
                      }
                    }
                    if (!sub) sub = 'Sem subcategoria'
                    subTotals[sub] = (subTotals[sub] || 0) + Number(r.valor || 0)
                    subDetails[sub] = subDetails[sub] || []
                    subDetails[sub].push(r)
                  })
                  const subs = Object.keys(subTotals)
                  return (
                    <div className="space-y-2">
                      {subs.map(sub => (
                        <div key={sub} className="border-b pb-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{sub}</div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold">R$ {subTotals[sub].toFixed(2)}</div>
                              <button className="btn-ghost" onClick={() => setSubOpen(prev => ({...prev, [cat]: {...(prev[cat]||{}), [sub]: !((prev[cat]||{})[sub])}}))} aria-expanded={!!(subOpen[cat]?.[sub])}>
                                <span className={`chev ${subOpen[cat] && subOpen[cat][sub] ? 'open' : ''}`}>{subOpen[cat] && subOpen[cat][sub] ? '▾' : '▸'}</span>
                              </button>
                            </div>
                          </div>
                          {open[cat] && open[cat][sub] && (
                            <div className="mt-2 overflow-x-auto">
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
                                  {subDetails[sub].map(row => {
                                    // parse as local date and format as DD/MM
                                    let dStr = '-'
                                    if (row.data){
                                      try{
                                        const [yy, mm, dd] = row.data.toString().split('-').map(x=>Number(x))
                                        if (!isNaN(yy) && !isNaN(mm) && !isNaN(dd)) dStr = `${String(dd).padStart(2,'0')}/${String(mm).padStart(2,'0')}`
                                      }catch(_){}
                                    }
                                    return (
                                      <tr key={row.id} className="align-top border-b last:border-b-0">
                                        <td className="py-1 px-2 text-sm muted whitespace-nowrap">{dStr}</td>
                                        <td className="py-1 px-2 text-sm muted truncate overflow-hidden whitespace-nowrap">{row.descricao ?? ''}</td>
                                        <td className="py-1 px-2 text-sm text-right whitespace-nowrap">R$ {Number(row.valor || 0).toFixed(2)}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
