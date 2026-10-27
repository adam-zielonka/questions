import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { Button, Icon } from '@blueprintjs/core'
import Card from './Card'
import { isCorrect } from '../utils/Utils'
import { useStore } from '../Store'

const Answer = observer(({ answer, answered, index }) => {
  const state = answered ? (answer.correct ? 'is-correct' : answer.checked ? 'is-incorrect' : 'is-muted') : answer.checked ? 'is-selected' : ''
  return <label className={`answer ${state}`}>
    <input type="checkbox" checked={Boolean(answer.checked)} onChange={event => answer.checked = event.target.checked} disabled={answered}/>
    <span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
    <span className="answer-text">{answer.value}</span>
    {answered && (answer.correct || answer.checked) && <span className="answer-result"><Icon icon={answer.correct ? 'tick' : 'cross'}/><span>{answer.correct ? 'Correct answer' : 'Your answer'}</span></span>}
  </label>
})

function Question({ value, navigate = true }) {
  const { questions, filteredQuestions, setNextIndex, setBackIndex, setHidden, setDanger } = useStore()
  const feedback = useRef(null)
  const justChecked = useRef(false)
  useEffect(() => {
    if(justChecked.current && feedback.current) {
      feedback.current.focus({ preventScroll: true })
      justChecked.current = false
    }
  }, [value, value && value.answered])
  if(!value) return null
  const number = questions.indexOf(value) + 1
  const correct = value.answered && isCorrect(value)
  const next = () => { setNextIndex(); document.getElementById('practice').focus({ preventScroll: true }) }
  return <Card className="question-card" id={`question-${value.hash}`}>
    <div className="question-meta"><span>QUESTION {String(number).padStart(2, '0')} <span className="question-total">/ {questions.length}</span></span><span className={`difficulty ${value.danger ? 'difficult' : value.hidden ? 'easy' : ''}`}>{value.danger ? 'Difficult' : value.hidden ? 'Easy' : 'Normal'}</span></div>
    <div className="question-content" dangerouslySetInnerHTML={{ __html: value.question }}/>
    <fieldset className="answers"><legend>Select all answers you think are correct.</legend>
      {value.answers.map((answer, index) => <Answer key={index} answer={answer} answered={value.answered} index={index}/>)}
    </fieldset>
    {value.answered && <div ref={feedback} tabIndex={-1} className={`feedback ${correct ? 'success' : 'review'}`} role="status"><Icon icon={correct ? 'tick-circle' : 'info-sign'}/><div><strong>{correct ? 'Nicely done. You got it right!' : 'A little more practice.'}</strong><p>{correct ? 'Keep going to build your knowledge.' : 'Compare your choices with the correct answers marked above.'}</p></div></div>}
    <div className="question-actions">
      <div className="question-navigation">
        {navigate && <Button minimal icon="arrow-left" text="Previous" disabled={filteredQuestions.length < 2} onClick={setBackIndex}/>}
        {!value.answered && <Button intent="primary" text="Check answer" icon="tick" onClick={() => { justChecked.current = true; value.answered = true }}/>}
        {navigate && <Button intent={value.answered ? 'primary' : 'none'} minimal={!value.answered} text={value.answered ? 'Next question' : 'Skip for now'} rightIcon="arrow-right" disabled={filteredQuestions.length < 2} onClick={next}/>}
        {!navigate && value.answered && <span className="checked-label"><Icon icon={correct ? 'tick' : 'cross'}/>{correct ? 'Correct' : 'Reviewed'}</span>}
      </div>
      <div className="difficulty-actions" role="group" aria-label={`Difficulty of question ${number}`}><span>Mark as</span><Button small minimal text="Easy" active={Boolean(value.hidden)} aria-pressed={Boolean(value.hidden)} onClick={() => setHidden(value)}/><Button small minimal icon="flag" text="Difficult" active={Boolean(value.danger)} aria-pressed={Boolean(value.danger)} onClick={() => setDanger(value)}/></div>
    </div>
  </Card>
}

export default observer(Question)
