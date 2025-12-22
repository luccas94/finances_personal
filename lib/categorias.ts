export function categorize(description: string) {
  const text = (description || '').toUpperCase()
  if (text.includes('IFOOD')) return { categoria: 'Alimentação', subcategoria: 'Delivery' }
  if (text.includes('UBER')) return { categoria: 'Transporte', subcategoria: 'App' }
  if (text.includes('SUPERMERCADO') || text.includes('SUPERMKT') || text.includes('PÃO') || text.includes('MERCE')) return { categoria: 'Alimentação', subcategoria: 'Mercado' }
  return { categoria: '', subcategoria: '' }
}
