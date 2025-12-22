'use client'
import { useState } from 'react'
import CategoriaSelect from './CategoriaSelect'

export default function DespesaForm(){
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataDespesa, setDataDespesa] = useState<string>(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
  })
  const [categoria, setCategoria] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [parentCategoria, setParentCategoria] = useState('')
  const [parentId, setParentId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try{
      const num = Number(String(valor).replace(',', '.')) || 0
      // try get user id
      const { data: userData } = await (await import('../lib/supabaseClient')).supabase.auth.getUser()
      const userId = (userData as any)?.user?.id ?? null

      const today = new Date()
      const fallbackLocalDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      const selectedDate = dataDespesa || fallbackLocalDate

      const insertPayload: any = {
        user_id: userId,
        valor: num,
        descricao,
        data: selectedDate,
        categoria: parentCategoria || categoria || null,
        subcategoria: categoria || null,
        // store IDs: prefer parentId for categoria_id, and categoriaId for subcategoria_id
        categoria_id: parentId ?? categoriaId ?? null,
        subcategoria_id: categoriaId ?? null,
        estabelecimento: null,
        criado_em: new Date().toISOString()
      }

      const { data: inserted, error } = await (await import('../lib/supabaseClient')).supabase.from('despesas').insert(insertPayload).select().single()
      if (error) throw error
      // if the returned row doesn't have `data`, update explicitly to ensure date is saved
      const saved: any = inserted
      if (!saved?.data) {
        const { error: updErr } = await (await import('../lib/supabaseClient')).supabase.from('despesas').update({ data: selectedDate }).eq('id', saved.id)
        if (updErr) throw updErr
      }
      setMessage('Despesa salva com sucesso')
      setValor('')
      setDescricao('')
      setDataDespesa(fallbackLocalDate)
      setCategoria('')
      setCategoriaId(null)
      setParentCategoria('')
      setParentId(null)
    }catch(err:any){
      console.error(err)
      setMessage('Erro ao salvar: ' + (err.message || String(err)))
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <label className="text-xs muted">Valor</label>
      <input className="input" placeholder="0.00" inputMode="decimal" value={valor} onChange={e=>setValor(e.target.value)} />

      <label className="text-xs muted">Descrição</label>
      <input className="input" placeholder="Descrição do estabelecimento" value={descricao} onChange={e=>setDescricao(e.target.value)} />

      <label className="text-xs muted">Data</label>
      <input type="date" className="input" value={dataDespesa} onChange={e=>setDataDespesa(e.target.value)} />

      <label className="text-xs muted">Categoria</label>
      <CategoriaSelect value={categoria} onChange={(v, id)=>{ setCategoria(v); setCategoriaId(id ?? null) }} onParentChange={(v,id)=>{ setParentCategoria(v); setParentId(id ?? null) }} />

      {message && <div className="text-sm muted">{message}</div>}
      <div>
        <button className="btn-primary" type="submit" style={{width:'100%'}} disabled={loading}>{loading ? 'Salvando...' : 'Salvar despesa'}</button>
      </div>
    </form>
  )
}
