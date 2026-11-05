import React from 'react'
import { observer } from 'mobx-react-lite'

function Question({ value, number }) {
  return <article className="question-card" aria-label={`Question ${number}`}>
    <h3>Question {number}</h3>
    <div className="question-content" dangerouslySetInnerHTML={{ __html: value.question }} />
    <ul className="answers">
      {value.answers.map((answer, index) => <li
        key={index}
        className={`answer${answer.correct === true ? ' answer-correct' : ''}`}
      >
        <label>
          <input type="checkbox" checked={answer.correct === true} disabled />
          <span className="answer-text">{answer.value}</span>
          <span className="answer-status">{answer.correct === true ? 'Correct answer' : 'Incorrect answer'}</span>
        </label>
      </li>)}
    </ul>
  </article>
}

export default observer(Question)
