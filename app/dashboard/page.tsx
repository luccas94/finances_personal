'use client'
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import Link from 'next/link'
import CategoryTable from '../../components/CategoryTable'

type Despesa = {
  id: string
  categoria: string | null
  subcategoria: string | null
  descricao?: string | null
  valor: number
  data?: string | null
  estabelecimento?: string | null
}

function monthRange(monthStr: string) {
  const [y, m] = monthStr.split('-').map(Number)
  const start = `${monthStr}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const end = `${monthStr}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export default function DashboardPage() {
  const today = new Date()
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth)
  const [items, setItems] = useState<Despesa[]>([])
  const [total, setTotal] = useState<number>(0)
  const [prevTotal, setPrevTotal] = useState<number>(0)

  async function fetchItems(month = selectedMonth) {
    const { start, end } = monthRange(month)
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('id,categoria,subcategoria,descricao,valor,data,estabelecimento')
        .gte('data', start)
        .lte('data', end)
        .order('data', { ascending: false })

      if (error) {
        console.log('supabase error', error)
        setItems([])
        setTotal(0)
      } else {
        const parsed = (data || []).map((r: any) => ({
          id: r.id,
          categoria: r.categoria,
          subcategoria: r.subcategoria,
          descricao: r.descricao,
          valor: Number(r.valor || 0),
          data: r.data,
          estabelecimento: r.estabelecimento
        }))
        // dedupe by id in case the query returns duplicates
        const uniqueMap = new Map(parsed.map(p => [p.id, p]))
        const unique = Array.from(uniqueMap.values())
        setItems(unique)
        setTotal(unique.reduce((s:any, it:any) => s + Number(it.valor || 0), 0))
      }

      // previous month
      const [y, m] = month.split('-').map(Number)
      const prevDate = new Date(y, m-2, 1) // month-2 gives previous month (Date month is 0-indexed)
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth()+1).padStart(2,'0')}`
      const { start: pstart, end: pend } = monthRange(prevMonth)
      const { data: pData, error: pErr } = await supabase
        .from('despesas')
        .select('valor')
        .gte('data', pstart)
        .lte('data', pend)

      if (pErr) {
        setPrevTotal(0)
      } else {
        setPrevTotal((pData || []).reduce((s:any, r:any) => s + Number(r.valor || 0), 0))
      }

    } catch (e) {
      console.error(e)
      setItems([])
      setTotal(0)
      setPrevTotal(0)
    }
  }

  useEffect(() => { fetchItems(selectedMonth) }, [selectedMonth])

  const diff = total - prevTotal
  const diffPct = prevTotal === 0 ? (total === 0 ? 0 : 100) : (diff / prevTotal) * 100

  return (
    <section>
      <div className="mx-auto max-w-[648px] mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{textAlign:'center'}}>Dashboard</h2>

        <div className="cards-strip">
          <div className="card" style={{flex: '0 0 200px', maxWidth: '200px'}}>
            <p className="text-sm muted">Gasto no mês</p>
            <p className="text-2xl font-bold mt-2">R$ {total.toFixed(2)}</p>
          </div>
          <div className="card" style={{flex: '0 0 200px', maxWidth: '200px'}}>
            <p className="text-sm muted">Mês anterior</p>
            <p className="text-2xl font-bold mt-2">R$ {prevTotal.toFixed(2)}</p>
          </div>
          <div className="card" style={{flex: '0 0 200px', maxWidth: '200px'}}>
            <p className="text-sm muted">Variação</p>
            <p className="text-2xl font-bold mt-2">{diff >=0 ? '▲' : '▼'} R$ {Math.abs(diff).toFixed(2)} <span className="text-sm muted">({diffPct.toFixed(0)}%)</span></p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[648px]">
        <h3 className="text-lg font-semibold mb-3" style={{textAlign:'center'}}>Categorias</h3>
-        <CategoryTable items={items} />
+        <CategoryTable items={items} refreshItems={fetchItems} />
      </div>
    </section>
  )
}
