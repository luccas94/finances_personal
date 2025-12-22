import pdf from 'pdf-parse'

export async function parsePdf(buffer: Buffer) {
  const data = await pdf(buffer)
  const text = data.text || ''
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  const entries: Array<any> = []

  const moneyRegex = /(-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/
  const dateRegex = /(\d{2}\/\d{2}\/\d{4})/

  for (const line of lines) {
    const moneyMatch = line.match(moneyRegex)
    const dateMatch = line.match(dateRegex)
    if (moneyMatch) {
      entries.push({
        descricao: line.replace(moneyMatch[0], '').trim(),
        valor: moneyMatch[0].replace('.', '').replace(',', '.').replace(/[R$]/g, ''),
        data: dateMatch ? dateMatch[1] : ''
      })
    }
  }

  return entries
}
