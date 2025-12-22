import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('image') as File | null
    return NextResponse.json({ valor: 0, data: '', descricao: '' })
  } catch (err) {
    return NextResponse.json({ error: 'Erro no OCR', detail: String(err) }, { status: 500 })
  }
}
