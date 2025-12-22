'use client'
import UploadPDF from '../../../components/UploadPDF'

export default function ImportarFaturaPage() {
  return (
    <main className="container">
      <h2 className="text-xl font-semibold mb-4">Importar fatura (PDF)</h2>
      <UploadPDF />
    </main>
  )
}
