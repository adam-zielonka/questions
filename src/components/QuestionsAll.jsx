import React from 'react'
import { observer } from 'mobx-react-lite'
import Question from './Question'
import { useStore } from '../Store'

function QuestionAll() {
  const { filteredQuestions, settings } = useStore()
  const { showAll } = settings

  if(!showAll) return ''

  return filteredQuestions.map(q => <Question 
    key={q.hash} 
    value={q}
    navigate={false}
  />)
}

export default observer(QuestionAll)
