import React from 'react'
import { observer } from 'mobx-react-lite'
import { Button } from '@blueprintjs/core'
import Card from './Card'
import { isCorrect } from '../utils/Utils'
import { useStore } from '../Store'

const QuestionButton = observer(({ question }) => {
  const { questions, setIndex } = useStore()
  const index = questions.findIndex(q => q === question)

  return <Button
    intent={question.answered ? (isCorrect(question) ? 'success' : 'danger') : 'none'}
    text={index+1}
    active={question.active}
    onClick={() => setIndex(index)}
  />
})


function QuestionsBar() {
  const { length, filteredQuestions } = useStore()

  if(!length) return ''

  return <Card>
    {filteredQuestions.map(q => <QuestionButton key={q.hash} question={q} />)}
  </Card>
}

export default observer(QuestionsBar)
