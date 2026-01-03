import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabaseClient'

export async function GET() {
  try {
    const { data: despesasData, error: dErr } = await supabase
      .from('despesas')
      .select('id,valor,data,descricao,categoria,subcategoria,estabelecimento,categoria_id,subcategoria_id')
      .order('data', { ascending: false })

    if (dErr) throw dErr

    const despesas = (despesasData || []).map((r: any) => ({
      id: r.id,
      valor: Number(r.valor || 0),
      data: r.data,
      descricao: r.descricao,
      categoria: r.categoria,
      subcategoria: r.subcategoria,
      estabelecimento: r.estabelecimento,
      categoria_id: r.categoria_id,
      subcategoria_id: r.subcategoria_id
    }))

    const { data: catsData, error: cErr } = await supabase
      .from('categorias')
      .select('id,nome,parent_id')

    if (cErr) throw cErr

    const cats = (catsData || []) as Array<{ id: number; nome: string; parent_id: number | null }>
    const catById = new Map<number, string>()
    const parentById = new Map<number, number | null>()
    cats.forEach(c => { catById.set(c.id, c.nome); parentById.set(c.id, c.parent_id) })

    // distinct lists
    const distinctCategories = Array.from(new Set(despesas.map(d => d.categoria).filter(Boolean)))
    const distinctSubcategories = Array.from(new Set(despesas.map(d => d.subcategoria).filter(Boolean)))

    // totals by category and by category+sub
    const totalsByCategory: Record<string, { categoria: string | null, cnt: number, total: number }> = {}
    const totalsByCategorySub: Record<string, { categoria: string | null, subcategoria: string | null, cnt: number, total: number }> = {}

    despesas.forEach(d => {
      const catKey = String(d.categoria || 'SEM_CATEGORIA')
      totalsByCategory[catKey] = totalsByCategory[catKey] || { categoria: d.categoria, cnt: 0, total: 0 }
      totalsByCategory[catKey].cnt += 1
      totalsByCategory[catKey].total += Number(d.valor || 0)

      const csKey = `${catKey}::${String(d.subcategoria || 'SEM_SUB')}`
      totalsByCategorySub[csKey] = totalsByCategorySub[csKey] || { categoria: d.categoria, subcategoria: d.subcategoria, cnt: 0, total: 0 }
      totalsByCategorySub[csKey].cnt += 1
      totalsByCategorySub[csKey].total += Number(d.valor || 0)
    })

    const totalsByCategoryArr = Object.values(totalsByCategory).sort((a,b)=>b.total - a.total)
    const totalsByCategorySubArr = Object.values(totalsByCategorySub).sort((a,b)=>b.total - a.total)

    // last entry per category (by data)
    const lastByCategory = new Map<string, any>()
    despesas.forEach(d => {
      const key = String(d.categoria || 'SEM_CATEGORIA')
      const prev = lastByCategory.get(key)
      if (!prev) lastByCategory.set(key, d)
      else {
        const prevDate = prev?.data ? new Date(prev.data) : null
        const curDate = d?.data ? new Date(d.data) : null
        if (!prevDate && curDate) lastByCategory.set(key, d)
        else if (prevDate && curDate && curDate > prevDate) lastByCategory.set(key, d)
      }
    })

    // joined view (despesa + categoria names)
    const joined = despesas.map(d => {
      const catName = d.categoria_id ? catById.get(Number(d.categoria_id)) || d.categoria : d.categoria
      const parentName = d.categoria_id ? parentById.get(Number(d.categoria_id)) : null
      const parentLabel = parentName ? catById.get(Number(parentName)) : null
      return { ...d, categoria_nome: catName || null, categoria_pai: parentLabel || null }
    })

    return NextResponse.json({
      count: despesas.length,
      distinctCategories,
      distinctSubcategories,
      totalsByCategory: totalsByCategoryArr,
      totalsByCategorySub: totalsByCategorySubArr,
      lastByCategory: Object.fromEntries(Array.from(lastByCategory.entries())),
      joined
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
