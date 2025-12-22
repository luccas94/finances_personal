'use client'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'Alimentação', label: 'Alimentação' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Moradia', label: 'Moradia' },
  { value: '', label: '— Sem categoria —' }
]

export default function CategoriaSelect({ value, onChange }:{ value?: string, onChange: (v:string)=>void }){
  return (
    <select className="border p-2" value={value || ''} onChange={e=>onChange(e.target.value)}>
      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
    </select>
  )
}
