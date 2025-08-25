import React from 'react'
import { Challenge } from '@/lib/types'

interface DevDiagnosticsProps {
  challenges: Challenge[]
  activeCode: string | null
}

export const DevDiagnostics: React.FC<DevDiagnosticsProps> = ({ challenges, activeCode }) => {
  if (process.env.NODE_ENV === 'production') return null
  const active = challenges.find(c => c.code === activeCode)
  const summary = active?.pointsSummary
  return (
    <div style={{position:'fixed',bottom:8,right:8,fontSize:11,fontFamily:'monospace',background:'rgba(0,0,0,0.6)',color:'#fff',padding:'6px 8px',borderRadius:6,zIndex:9999,maxWidth:260,lineHeight:1.3}}>
      <div><strong>Dev Diagnostics</strong></div>
      <div>Active Code: {activeCode || '—'}</div>
      <div>Challenges: {challenges.length}</div>
      {active && (
        <>
          <div>Active ID: {active.id}</div>
          <div>Participants: {active.participants.length}</div>
          <div>Tasks: {active.tasks.length}</div>
          <div>Summary: {summary ? 'yes' : 'no'}</div>
          {summary && (
            <div style={{maxHeight:80,overflow:'auto'}}>
              {Object.entries(summary.pointsByUser).map(([uid, pts]) => (
                <div key={uid}>{uid.slice(-4)}: {pts}</div>
              ))}
              <div>MaxPoints: {summary.maxPoints}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}