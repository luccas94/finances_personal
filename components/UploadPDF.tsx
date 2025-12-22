'use client'
import { useState } from 'react'

export default function UploadPDF(){
  const [file, setFile] = useState<File | null>(null)
  const [entries, setEntries] = useState<any[]>([])

  async function handleUpload(e: React.FormEvent){
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('pdf', file)
    const res = await fetch('/api/importar-fatura', { method: 'POST', body: fd })
    const data = await res.json()
    setEntries(data || [])
  }

  return (
    <div className="card">
      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <div className="file-wrapper">
          <input className="file-input" type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" type="submit">Enviar PDF</button>
        </div>
      </form>
      <div className="mt-4">
        {entries.length === 0 && <p className="text-sm muted">Nenhum lançamento detectado</p>}
        <ul className="mt-2 space-y-2">
          {entries.map((it, idx)=> (
            <li key={idx} className="p-3 bg-white rounded shadow-sm flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold">{it.descricao}</div>
                <div className="text-xs muted">{it.data}</div>
              </div>
              <div className="font-medium">R$ {it.valor}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
