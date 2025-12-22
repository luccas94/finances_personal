'use client'
import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'

type Categoria = { id: number, nome: string, slug: string, parent_id: number | null }

export default function CategoriaSelect({ value, onChange, onParentChange }:{ value?: string, onChange: (v:string, id?:number)=>void, onParentChange?: (v:string, id?:number)=>void }){
  const [cats, setCats] = useState<Categoria[]>([])
  const [parents, setParents] = useState<Categoria[]>([])
  const [subs, setSubs] = useState<Categoria[]>([])
  const [selectedParent, setSelectedParent] = useState<number | null>(null)

  useEffect(() => {
    async function load(){
      const { data, error } = await supabase.from('categorias').select('id,nome,slug,parent_id')
      if (error) return console.error('failed load categories', error)
      const parsed = (data||[]) as Categoria[]
      setCats(parsed)
      const p = parsed.filter(c => c.parent_id === null)
      setParents(p)
    }
    load()
  },[])

  useEffect(() => {
    if (selectedParent == null){
      setSubs([])
      return
    }
    setSubs(cats.filter(c => c.parent_id === selectedParent))
  },[selectedParent, cats])

  return (
    <div className="flex flex-col gap-2">
      <select className="input" value={selectedParent ?? ''} onChange={e=>{
        const v = e.target.value ? Number(e.target.value) : null
        setSelectedParent(v)
        const parent = v ? parents.find(p=>p.id===v) : null
        if (onParentChange) onParentChange(parent?.nome || '', parent?.id)
        onChange('')
      }}>
        <option value="">— Selecione categoria —</option>
        {parents.map(p=> <option key={p.id} value={p.id}>{p.nome}</option>)}
      </select>

      <select className="input" value={value ?? ''} onChange={e=>{
        const val = e.target.value
        // find selected subcategory from full list (not only current subs) to be robust
        const selected = cats.find(c => c.nome === val)
        // if found, ensure parent is selected in UI and notify parent handler
        if (selected && selected.parent_id) {
          const parent = parents.find(p=>p.id===selected.parent_id)
          if (parent){
            setSelectedParent(parent.id)
            if (onParentChange) onParentChange(parent.nome, parent.id)
          }
        }
        onChange(val, selected?.id)
      }} disabled={subs.length===0}>
        <option value="">— Selecione subcategoria —</option>
        {subs.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
      </select>
      <div className="text-xs muted">Dica: escolha a categoria pai e em seguida a subcategoria</div>
    </div>
  )
}
