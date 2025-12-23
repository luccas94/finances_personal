'use client'
import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'

type Row = {
  id: string
  data?: string | null
  descricao?: string | null
  categoria?: string | null
  subcategoria?: string | null
  valor: number
}

export default function DespesasTable(){
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load(){
      setLoading(true)
      const { data, error } = await supabase.from('despesas').select('id,data,descricao,categoria,subcategoria,valor').order('data', { ascending: false }).limit(200)
      if (!mounted) return
      if (error) {
        console.error(error)
        setRows([])
      } else {
        setRows((data||[]) as Row[])
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="card p-3">
      <h3 className="text-lg font-semibold mb-3">Despesas recentes</h3>
      {loading ? <div className="muted">Carregando...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm muted">
                <th className="px-2">Data</th>
                <th className="px-2">Descrição</th>
                <th className="px-2">Categoria</th>
                <th className="px-2">Subcategoria</th>
                <th className="px-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                // format date as DD/MM/YY if possible
                let d = '-' 
                if (r.data){
                  try{
                    const [yy, mm, dd] = r.data.toString().split('-').map(x=>Number(x))
                    d = `${String(dd).padStart(2,'0')}/${String(mm).padStart(2,'0')}/${String(yy).slice(-2)}`
                  }catch(_){ }
                }
                return (
                  <tr key={r.id} className="align-top border-b last:border-b-0">
                    <td className="py-2 px-2 text-sm muted whitespace-nowrap">{d}</td>
                    <td className="py-2 px-2 text-sm truncate">{r.descricao ?? '-'}</td>
                    <td className="py-2 px-2 text-sm muted">{r.categoria ?? '-'}</td>
                    <td className="py-2 px-2 text-sm muted">{r.subcategoria ?? '-'}</td>
                    <td className="py-2 px-2 text-sm text-right">R$ {Number(r.valor || 0).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
