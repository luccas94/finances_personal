'use client'
import { useState } from 'react'

export default function CameraInput() {
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('image', file)
    fetch('/api/ocr', { method: 'POST', body: fd }).then(r => r.json()).then(console.log).catch(console.error)
  }

  return (
      <div className="card">
      <label className="block mb-2">Tirar foto / selecionar imagem</label>
        <div className="file-wrapper">
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="file-input" />
        </div>
      {preview && <img src={preview} alt="preview" className="mt-2 w-full max-h-60 object-cover rounded-lg" />}
    </div>
  )
}
