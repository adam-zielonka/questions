import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../Store'

function Stats() {
  const { stats } = useStore()
  const { all, answered, correct, incorrect } = stats
  if(!all) return null
  const progress = Math.round(answered / all * 100)
  return <section className="stats-grid" aria-label="Study progress">
    <div className="stat-progress"><div className="stat-label">Session progress <span>{progress}%</span></div><div className="stat-value">{answered}<span> / {all} answered</span></div><div className="progress-track" role="progressbar" aria-label="Questions answered" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={all}><span style={{ width: `${progress}%` }}/></div></div>
    <div className="stat"><div className="stat-label"><span className="status-dot correct"/>Correct</div><div className="stat-value">{correct}<span> questions</span></div></div>
    <div className="stat"><div className="stat-label"><span className="status-dot incorrect"/>To revisit</div><div className="stat-value">{incorrect}<span> questions</span></div></div>
    <div className="stat"><div className="stat-label">Accuracy</div><div className="stat-value">{answered ? `${Math.round(correct / answered * 100)}%` : '—'}<span>{answered ? ' of answered' : ' start practicing'}</span></div></div>
  </section>
}

export default observer(Stats)
