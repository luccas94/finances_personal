"use client"
import React from 'react'
import MockDashboard from '../../components/MockDashboard'
import MockConnections from '../../components/MockConnections'

export default function PreviewPage(){
  return (
    <div style={{display:'flex',gap:24,justifyContent:'center',padding:24,flexWrap:'wrap',background:'#f3f4f6',minHeight:'100vh'}}>
      <div style={{width:414,boxShadow:'0 10px 30px rgba(12,12,12,0.06)',borderRadius:20,overflow:'hidden'}}>
        <MockDashboard />
      </div>
      <div style={{width:414,boxShadow:'0 10px 30px rgba(12,12,12,0.06)',borderRadius:20,overflow:'hidden'}}>
        <MockConnections />
      </div>
    </div>
  )
}
