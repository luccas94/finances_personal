"use client"
import React, { useState } from 'react'
import supabase from '../lib/supabaseClient'

export default function EditLaunchModal({ launch, onClose, onSaved }: { launch: any | null, onClose: () => void, onSaved: () => void }){
  const [descricao, setDescricao] = useState(launch?.descricao || '')
  const [valor, setValor] = useState(launch ? String(launch.valor) : '')
  const [data, setData] = useState(launch?.data || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    setDescricao(launch?.descricao || '')
    setValor(launch ? String(launch.valor) : '')
    setData(launch?.data || '')
    setError(null)
  }, [launch])

  if (!launch) return null

  async function handleSave(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const payload: any = { descricao: descricao || null }
      // normalize number
      const parsed = Number((valor||'').toString().replace(/[^0-9.-]/g,''))
      payload.valor = isNaN(parsed) ? 0 : parsed
      payload.data = data || null

      const { error } = await supabase.from('despesas').update(payload).eq('id', launch.id)
      if (error) throw error
      onSaved()
      onClose()
    }catch(e:any){
      setError(e.message || JSON.stringify(e))
    }finally{ setLoading(false) }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.36)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:80}}>
      <div className="card" style={{minWidth:320,maxWidth:520}}>
        <h3 className="text-lg font-semibold">Editar lançamento</h3>
        <form onSubmit={handleSave} className="flex flex-col gap-3 mt-3">
          <label className="text-sm">Data</label>
          <input type="date" className="input" value={data || ''} onChange={e => setData(e.target.value)} />

          <label className="text-sm">Descrição</label>
          <input className="input" value={descricao || ''} onChange={e => setDescricao(e.target.value)} />

          <label className="text-sm">Valor</label>
          <input className="input" value={valor || ''} onChange={e => setValor(e.target.value)} />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:6}}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
