"use client"
import React from 'react'

export default function LaunchesCard(){
  return (
    <div className="card feature" style={{padding:'0.9rem 1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,fontWeight:700}}>Lançamentos disponíveis</div>
          <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
            <div style={{width:28,height:28,borderRadius:8,background:'#7c3aed',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>nu</div>
            <div style={{width:28,height:28,borderRadius:8,background:'#fb923c',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>it</div>
            <div style={{width:28,height:28,borderRadius:8,background:'#0ea5a4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>ca</div>
            <div style={{width:28,height:28,borderRadius:8,background:'#ef4444',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>bb</div>
            <div style={{width:28,height:28,borderRadius:8,background:'#d1d5db',display:'flex',alignItems:'center',justifyContent:'center'}}>+</div>
          </div>
        </div>
        <button className="btn-ghost">Visualizar</button>
      </div>
    </div>
  )
}
