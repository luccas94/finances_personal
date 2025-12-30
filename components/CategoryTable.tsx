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
        parents.forEach(p => {
          const subs = rows.filter(s => s.parent_id === p.id).map(s => s.nome.toUpperCase())
          subs.forEach(s => reverse[s] = p.nome.toUpperCase())
          map[p.nome.toUpperCase()] = subs
        })
        setCatMap(map)
        ;(window as any).__CAT_REVERSE__ = reverse
      }catch(e){ console.error(e) }
    }
    loadCats()
  }, [])

  // prepare grouped data
  const totalsByCategory: Record<string, number> = {}
  const detailsByCategory: Record<string, Item[]> = {}
  items.forEach(it => {
    let cat = (it.categoria || 'Sem categoria').toUpperCase()
    const reverse = (window as any).__CAT_REVERSE__ as Record<string,string> | undefined
    if (reverse && !Object.keys(STATIC_CATEGORIES).map(k=>k.toUpperCase()).includes(cat)){
      const mapped = reverse[cat]
      if (mapped) cat = mapped
    }
    totalsByCategory[cat] = (totalsByCategory[cat] || 0) + Number(it.valor || 0)
    detailsByCategory[cat] = detailsByCategory[cat] || []
    detailsByCategory[cat].push(it)
  })

  const parents = Array.from(new Set([...Object.keys(STATIC_CATEGORIES).map(k=>k.toUpperCase()), ...Object.keys(catMap), ...Object.keys(totalsByCategory)]))
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
                <div className="font-extrabold text-lg">{parent}</div>
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
