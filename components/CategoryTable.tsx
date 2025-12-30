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
import EditLaunchModal from './EditLaunchModal'

const STATIC_CATEGORIES: Record<string, string[]> = {
  'ALIMENTAÇÃO': ['IFOOD','MERCADO','RESTAURANTES','BARES'],
  'LAZER': ['TABACO/SEDA','DISTRIBUIDORA'],
  'CARRO': ['COMBUSTIVEL','MANUTENÇÃO','ESTACIONAMENTO','LAVA CAR'],
  'PIX NO CREDITO': ['PICPAY'],
  'CUIDADOS PESSOAIS': ['UNHA','CABELO','CILIOS'],
  'DIVERSOS': ['SHOPEE','MERCADO LIVRE','COMPRAS GERAIS']
}

function normalizeKey(s?: string){
  if (!s) return 'SEM_CATEGORIA'
  return s.toString().normalize('NFKD').replace(/\p{Diacritic}/gu, '').trim().toUpperCase()
}

export default function CategoryTable({ items, refreshItems }: { items: Item[], refreshItems?: (month?: string) => void }){
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
        const displayMap: Record<string,string> = {}

        parents.forEach(p => {
          const pKey = normalizeKey(p.nome)
          const subs = rows.filter(s => s.parent_id === p.id).map(s => s.nome)
          // store subs as original strings
          map[pKey] = subs
          subs.forEach(s => { reverse[normalizeKey(s)] = pKey })
          // remember display name
          displayMap[pKey] = p.nome.toUpperCase()
        })

        setCatMap(map)
        ;(window as any).__CAT_REVERSE__ = reverse
        ;(window as any).__CAT_DISPLAY__ = displayMap
      }catch(e){ console.error(e) }
    }
    loadCats()
  }, [])

  // prepare grouped data (normalize keys to avoid duplicates caused by accents/case variations)
  const totalsByCategory: Record<string, number> = {}
  const detailsByCategory: Record<string, Item[]> = {}
  const displayNameMap: Record<string,string> = {}

  items.forEach(it => {
    const rawCat = it.categoria || 'Sem categoria'
    let key = normalizeKey(rawCat)
    // if there is a reverse mapping from subcategory to parent key (set during loadCats), use it
    const reverse = (window as any).__CAT_REVERSE__ as Record<string,string> | undefined
    if (reverse){
      const maybe = reverse[normalizeKey(key)]
      if (maybe) key = maybe
    }

    totalsByCategory[key] = (totalsByCategory[key] || 0) + Number(it.valor || 0)
    detailsByCategory[key] = detailsByCategory[key] || []
    detailsByCategory[key].push(it)
    if (!displayNameMap[key]) displayNameMap[key] = (rawCat || '').toString().toUpperCase()
  })

  // build ordered list of parent keys (normalized) preserving desired order: STATIC_CATEGORIES, catMap, totals
  const orderedKeys: string[] = []
  const pushIf = (k: string) => { if (!orderedKeys.includes(k)) orderedKeys.push(k) }
  // static categories (normalize)
  Object.keys(STATIC_CATEGORIES).forEach(k => pushIf(normalizeKey(k)))
  // categories from DB (catMap keys are normalized already)
  Object.keys(catMap).forEach(k => pushIf(k))
  // categories coming from data
  Object.keys(totalsByCategory).forEach(k => pushIf(k))

  const parents = Array.from(new Set(orderedKeys))

  // debug: log parents and duplicates
  if (process.env.NODE_ENV !== 'production') {
    try {
      const counts: Record<string, number> = {}
      parents.forEach(p => counts[p] = (counts[p] || 0) + 1)
      const dupes = Object.entries(counts).filter(([,c])=>c>1)
      if (dupes.length) console.warn('Duplicate parents found', dupes)
      console.debug('CategoryTable parents', parents.length, parents)
    } catch (_) {}
  }

  const [editingRow, setEditingRow] = useState<Item | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(row: Item){
    try{
      if (!confirm('Confirma exclusão deste lançamento?')) return
      setDeletingId(row.id)
      const { error } = await supabase.from('despesas').delete().eq('id', row.id)
      if (error) throw error
      // refresh data
      refreshItems?.()
    }catch(e:any){
      alert('Erro ao deletar: ' + (e.message || JSON.stringify(e)))
    }finally{ setDeletingId(null) }
  }

  return (
    <div className="space-y-5">
      {parents.map(parent => {
        const total = totalsByCategory[parent] ?? 0
        const rows = detailsByCategory[parent] || []

        // group rows by subcategoria
        const subTotals: Record<string, number> = {}
        const subRows: Record<string, Item[]> = {}
        rows.forEach(r => {
          const subKey = (r.subcategoria || r.categoria || 'Sem subcategoria').toString()
          subTotals[subKey] = (subTotals[subKey] || 0) + Number(r.valor || 0)
          subRows[subKey] = subRows[subKey] || []
          subRows[subKey].push(r)
        })

        return (
          <div key={parent} className="card category-card">
            <div className="collapse-header cursor-pointer" onClick={() => setOpen(prev => ({...prev, [parent]: !prev[parent]}))}>
              <div>
                <div className="font-extrabold text-lg">{ ((window as any).__CAT_DISPLAY__ && (window as any).__CAT_DISPLAY__[parent]) || displayNameMap[parent] || parent }</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold">R$ {total.toFixed(2)}</div>
                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); setOpen(prev => ({...prev, [parent]: !prev[parent]})) }} aria-expanded={!!open[parent]}>
                  <span className={`chev ${open[parent] ? 'open' : ''}`}>▾</span>
                </button>
              </div>
            </div>

            {open[parent] && (
              <div className="mt-3 border-t pt-3">
                <div className="space-y-3">
                  {Object.keys(subRows).map(sub => (
                    <div key={sub} className="subgroup">
                      <div className="subheader">
                        <div>
                          <div className="text-sm sub-title">{sub}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">R$ { (subTotals[sub]||0).toFixed(2) }</div>
                          <button type="button" className="btn-ghost" onClick={(e)=>{ e.stopPropagation(); setSubOpen(prev=>({ ...(prev), [parent]: { ...(prev[parent]||{}), [sub]: !prev[parent]?.[sub] } })) }}>
                            <span className={`chev ${subOpen[parent]?.[sub] ? 'open' : ''}`}>{ subOpen[parent]?.[sub] ? '▾' : '▸' }</span>
                          </button>
                        </div>
                      </div>

                      {subOpen[parent]?.[sub] && (
                        <div className="subdetails mt-2">
                          <div className="card p-3 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-xs muted">
                                  <th className="px-3 py-2 w-20">Data</th>
                                  <th className="px-3 py-2">Descrição</th>
                                  <th className="px-3 py-2 text-right w-28">Valor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subRows[sub].map(row => {
                                  const date = row.data ? (()=>{ const [y,m,d]=row.data.split('-'); return `${d.padStart(2,'0')}/${m.padStart(2,'0')}` })() : '-'
                                  return (
                                    <tr key={row.id} className="border-t last:border-b">
                                      <td className="px-3 py-2 whitespace-nowrap">{date}</td>
                                      <td className="px-3 py-2" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                                        <div style={{flex:1}}>{row.descricao ?? ''}</div>
                                        <div style={{flex:'0 0 auto', display:'flex', gap:8}}>
                                          <button className="btn-ghost" onClick={(e)=>{ e.stopPropagation(); setEditingRow(row) }} aria-label="Editar lançamento">✏️</button>
                                          <button className="btn-ghost" style={{color:'#ef4444'}} onClick={(e)=>{ e.stopPropagation(); handleDelete(row) }} aria-label="Excluir lançamento" disabled={deletingId===row.id}>{deletingId===row.id ? '...' : '🗑️'}</button>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-right font-semibold">R$ {Number(row.valor||0).toFixed(2)}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {editingRow && (
        <EditLaunchModal launch={editingRow} onClose={() => setEditingRow(null)} onSaved={() => { setEditingRow(null); refreshItems?.() }} />
      )}
    </div>
  )
}
