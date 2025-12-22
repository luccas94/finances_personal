import { NextResponse } from 'next/server'
import { parsePdf } from '../../../lib/pdfParser'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('pdf') as File | null
    if (!file) return NextResponse.json({ error: 'nenhum pdf' }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    const entries = await parsePdf(buf)
    return NextResponse.json(entries)
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao processar PDF', detail: String(err) }, { status: 500 })
  }
}
