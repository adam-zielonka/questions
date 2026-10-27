import React from 'react'
import { observer } from 'mobx-react-lite'
import { Button, Icon } from '@blueprintjs/core'
import { isCorrect } from '../utils/Utils'
import { useStore } from '../Store'

const QuestionButton = observer(({ question }) => {
  const { questions, index: selectedIndex, filteredQuestions, setIndex, settings } = useStore()
  const index = questions.indexOf(question)
  const selected = filteredQuestions.includes(questions[selectedIndex]) ? questions[selectedIndex] : filteredQuestions[0]
  const active = !settings.showAll && selected === question
  const state = question.answered ? (isCorrect(question) ? 'correct' : 'incorrect') : 'unanswered'
  return <Button className={`question-number ${state}`} text={index + 1} active={active} aria-current={active ? 'step' : undefined} aria-label={`Question ${index + 1}, ${state === 'incorrect' ? 'incorrect answer' : state}`} onClick={() => {
    setIndex(index)
    settings.showAll = false
    document.getElementById('practice').focus({ preventScroll: true })
    if(window.matchMedia('(max-width: 900px)').matches) document.getElementById('practice').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }}/>
})

function QuestionsBar() {
  const { length, filteredQuestions } = useStore()
  if(!length) return null
  return <aside className="question-sidebar" aria-label="Question navigator">
    <div className="section-heading"><h2>Question map</h2><span>{filteredQuestions.length} visible</span></div>
    <div className="card map-card"><div className="question-grid">{filteredQuestions.map(q => <QuestionButton key={q.hash} question={q}/>)}</div>
      {!filteredQuestions.length && <p className="map-empty">Adjust your filters to see questions.</p>}
      <div className="map-legend"><span><i className="status-dot correct"/>Correct</span><span><i className="status-dot incorrect"/>To revisit</span><span><i className="status-dot unanswered"/>Unanswered</span></div>
    </div>
    <div className="study-tip"><Icon icon="lightbulb"/><p><strong>A little every day goes a long way.</strong>Mark tricky questions as difficult, then use filters to focus your next round.</p></div>
  </aside>
}

export default observer(QuestionsBar)
