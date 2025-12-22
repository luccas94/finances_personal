"use client"
import { useEffect, useState } from 'react'
import supabase from '../../../lib/supabaseClient'

const PARENT_CATS: Record<string, string[]> = {
  'ALIMENTAÇÃO': ['IFOOD','MERCADO','RESTAURANTES','BARES'],
  'LAZER': ['TABACO/SEDA','DISTRIBUIDORA','UNHA','FARMÁCIA'],
  'CARRO': ['COMBUSTIVEL','MANUTENÇÃO','ESTACIONAMENTO','LAVA CAR'],
  'PIX NO CREDITO': ['PICPAY']
}

const COLORS = ['#0ea5a4','#f97316','#6366f1','#ef4444','#14b8a6','#f59e0b']

function formatMonthLabel(date: Date){
  return date.toLocaleString(undefined, { month: 'short', year: '2-digit' })
}

function monthsArray(count=6){
  const arr: Date[] = []
  const now = new Date()
  for(let i = count-1; i>=0; i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    arr.push(d)
  }
  return arr
}

export default function ComparativoPage(){
  const [loading, setLoading] = useState(true)
  const [dataByMonth, setDataByMonth] = useState<Record<string, number>>({})
  const [stackByMonth, setStackByMonth] = useState<Record<string, Record<string, number>>>({})

  useEffect(() => {
    async function load(){
      setLoading(true)
      const months = monthsArray(12)
      const start = months[0]
      const startISO = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-01`
      try{
        const { data, error } = await supabase.from('despesas').select('valor,data,categoria,subcategoria').gte('data', startISO)
        if (error) throw error
        // initialize
        const totals: Record<string, number> = {}
        const stacks: Record<string, Record<string, number>> = {}
        months.forEach(m => {
          const key = `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}`
          totals[key]=0
          stacks[key] = {}
        })

        ;(data||[]).forEach((row:any) => {
          const d = new Date(row.data)
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
          if (!(key in totals)) return
          const valor = Number(row.valor || 0)
          totals[key] += valor
          // map to parent category
          const catU = (row.categoria||'').toString().toUpperCase()
          const subU = (row.subcategoria||'').toString().toUpperCase()
          let parent = Object.keys(PARENT_CATS).find(p => PARENT_CATS[p].includes(subU) || PARENT_CATS[p].includes(catU))
          if (!parent) parent = 'Outros'
          stacks[key][parent] = (stacks[key][parent]||0) + valor
        })

        setDataByMonth(totals)
        setStackByMonth(stacks)
      }catch(e){
        console.error(e)
        setDataByMonth({})
        setStackByMonth({})
      }finally{ setLoading(false) }
    }
    load()
  }, [])

  const months = monthsArray()
  const keys = months.map(m => `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}`)
  const max = Math.max(...keys.map(k=>Number(dataByMonth[k]||0)), 1)

  const parents = Array.from(new Set([].concat(...Object.values(PARENT_CATS))))
  const parentKeys = Object.keys(PARENT_CATS).concat(['Outros'])

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Comparativo Mensal — Últimos 6 meses</h2>
      {loading ? <p className="muted">Carregando...</p> : (
        <div>
          <div className="mb-3 text-sm muted">Totais por mês (clique em 'Voltar' no navegador para sair)</div>
          <div className="w-full p-3 card overflow-x-auto">
            <div style={{display:'flex', alignItems:'end', gap:12, height:220}}>
              {keys.map((k, idx) => {
                const total = Number(dataByMonth[k]||0)
                const stack = stackByMonth[k] || {}
                return (
                  <div key={k} style={{display:'flex', flexDirection:'column', alignItems:'center', width:36}}>
                    <div style={{width:36,height:180,display:'flex',flexDirection:'column-reverse', justifyContent:'flex-start', alignItems:'stretch', borderRadius:6, overflow:'hidden', background:'#fff'}}>
                      {parentKeys.map((pk, pi) => {
                        const val = Number(stack[pk]||0)
                        const h = Math.round((val / max) * 100)
                        const color = COLORS[pi % COLORS.length]
                        return val>0 ? <div key={pk} title={`${pk}: R$ ${val.toFixed(2)}`} style={{height:`${h}%`, background:color}} /> : null
                      })}
                    </div>
                    <div className="text-sm muted mt-2" style={{fontSize:11}}>{formatMonthLabel(months[idx])}</div>
                    <div className="text-xs" style={{fontSize:11}}>{`R$ ${total.toFixed(0)}`}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 card p-3">
            <div className="text-sm font-semibold mb-2">Legenda</div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(PARENT_CATS).map((pk, i) => (
                <div key={pk} className="flex items-center gap-2">
                  <div style={{width:14,height:14,background:COLORS[i % COLORS.length],borderRadius:4}} />
                  <div className="text-sm muted">{pk}</div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div style={{width:14,height:14,background:'#777',borderRadius:4}} />
                <div className="text-sm muted">Outros</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
