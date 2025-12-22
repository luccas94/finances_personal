'use client'
import { useState } from 'react'
import CategoriaSelect from './CategoriaSelect'

export default function DespesaForm(){
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    // TODO: enviar para Supabase
    alert('Enviar despesa: ' + descricao + ' R$ ' + valor)
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <label className="text-xs muted">Valor</label>
      <input className="input" placeholder="0.00" inputMode="decimal" value={valor} onChange={e=>setValor(e.target.value)} />

      <label className="text-xs muted">Descrição</label>
      <input className="input" placeholder="Descrição do estabelecimento" value={descricao} onChange={e=>setDescricao(e.target.value)} />

      <label className="text-xs muted">Categoria</label>
      <CategoriaSelect value={categoria} onChange={setCategoria} />

      <div>
        <button className="btn-primary" type="submit" style={{width:'100%'}}>Salvar despesa</button>
      </div>
    </form>
  )
}
