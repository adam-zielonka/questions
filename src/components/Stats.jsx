import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../Store'

function Stats() {
  const { stats } = useStore()
  const { all, answered, correct, incorrect } = stats
  if(!all) return null
  const progress = Math.round(answered / all * 100)
  return <section className="stats-grid" aria-label="Study progress">
    <div className="stat-progress"><div className="stat-summary"><span className="stat-label">Answered</span><span className="stat-value">{answered}<span> / {all} · {progress}%</span></span></div><div className="progress-track" role="progressbar" aria-label="Questions answered" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={all}><span style={{ width: `${progress}%` }}/></div></div>
    <div className="stat"><span className="stat-label"><span className="status-dot correct"/>Correct</span><span className="stat-value">{correct}</span></div>
    <div className="stat"><span className="stat-label"><span className="status-dot incorrect"/>To revisit</span><span className="stat-value">{incorrect}</span></div>
    <div className="stat"><span className="stat-label">Accuracy</span><span className="stat-value">{answered ? `${Math.round(correct / answered * 100)}%` : '—'}</span></div>
  </section>
}

export default observer(Stats)
