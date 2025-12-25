"use client"
import React from 'react'

export default function MockDashboard(){
  return (
    <div className="container safe-area" style={{paddingTop:12}}>
      <div className="topbar">
        <div className="inner">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="avatar">M</div>
            <div>
              <div style={{fontSize:12,opacity:0.95}}>Bom dia,</div>
              <div className="title" style={{fontWeight:800,fontSize:16}}>Matheus</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="back">🔗</button>
          </div>
        </div>
      </div>

      <div style={{height:14}} />

      <div className="card feature">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,fontWeight:700}}>Lançamentos disponíveis</div>
            <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
              <div style={{width:28,height:28,borderRadius:8,background:'#5b21b6',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>nu</div>
              <div style={{width:28,height:28,borderRadius:8,background:'#f97316',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>it</div>
              <div style={{width:28,height:28,borderRadius:8,background:'#0ea5a4',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>ca</div>
              <div style={{width:28,height:28,borderRadius:8,background:'#ef4444',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>bb</div>
              <div style={{width:28,height:28,borderRadius:8,background:'#d1d5db',display:'flex',alignItems:'center',justifyContent:'center'}}>+</div>
            </div>
          </div>
          <button className="btn-ghost">Visualizar</button>
        </div>
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div className="card-sub">Saldo geral</div>
          <div className="balance">R$ 61,624.08</div>
          <div style={{height:8}} />
          <div style={{fontWeight:700}}>Minhas contas</div>

          <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>nu</div>
                <div>Nuconta</div>
              </div>
              <div style={{color:'#0ea5a4',fontWeight:700}}>R$ 60.500,56</div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:'#fb923c',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>it</div>
                <div>Itaú</div>
              </div>
              <div style={{color:'#ef4444',fontWeight:700}}>-R$126,48</div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:'#0ea5a4',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>ca</div>
                <div>Caixa</div>
              </div>
              <div style={{color:'#0f172a',fontWeight:700}}>R$ 1.250,00</div>
            </div>
          </div>

          <div style={{marginTop:8}}>
            <button className="btn-primary" style={{width:'100%'}}>Gerenciar contas</button>
          </div>
        </div>
      </div>

      <div style={{height:90}} />

      <div className="bottom-nav">
        <div className="bar">
          <a className="active">🏠 Home</a>
          <a>💸</a>
          <div className="center"><div className="plus">+</div></div>
          <a>📊</a>
          <a>⚙️</a>
        </div>
      </div>
    </div>
  )
}
