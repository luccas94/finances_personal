"use client"
import React from 'react'

export default function AccountsCard(){
  return (
    <div className="card" style={{marginTop:8}}>
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
  )
}
