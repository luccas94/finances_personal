"use client"
import React from 'react'

export default function MockConnections(){
  return (
    <div className="container safe-area" style={{paddingTop:12}}>
      <div className="topbar">
        <div className="inner" style={{alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="back" style={{marginRight:8}}>←</button>
            <div style={{fontWeight:800,color:'#fff'}}>Conexões bancárias</div>
          </div>
        </div>
      </div>

      <div style={{height:16}} />

      <div style={{padding:'0 0.6rem'}}>
        <div style={{fontWeight:800,fontSize:18,marginBottom:8}}>Seus bancos conectados</div>
        <div style={{color:'#6b7280',marginBottom:12}}>Os lançamentos futuros estarão disponíveis para importar a cada 6 horas.</div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {name:'Bradesco', subtitle:'2387 novos lançamentos', color:'#ef4444'},
            {name:'Nubank', subtitle:'145 novos lançamentos', color:'#7c3aed'},
            {name:'Santander', subtitle:'Sem novos lançamentos', color:'#ef4444'},
            {name:'Caixa Econômica Federal', subtitle:'Sem novos lançamentos', color:'#0ea5a4'},
          ].map((b,i)=> (
            <div key={i} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:48,height:48,borderRadius:12,background:b.color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>{b.name.split(' ')[0].slice(0,2)}</div>
                <div>
                  <div style={{fontWeight:700}}>{b.name}</div>
                  <div style={{color:'#0ea5a4',marginTop:4}}>{b.subtitle}</div>
                </div>
              </div>
              <div style={{color:'#0ea5a4'}}>›</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
