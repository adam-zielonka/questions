import React from 'react'
import { observer } from 'mobx-react-lite'
import Card from './Card'
import { useStore } from '../Store'

function Stats() {
  const { stats, index } = useStore()
  const { all, answered, correct, incorrect, hidden, danger } = stats

  if(!all) return ''
  const hiddenText = hidden ? `Easy: ${hidden},` : ''
  const normalText = hidden || danger ? `Normal: ${all-(danger+hidden)},` : ''
  const dangerText = danger ? `Danger: ${danger},` : ''

  return <Card>
    <b>{index+1}/{all}</b>, {hiddenText} {normalText} {dangerText} Empty: {all-answered},
    Answered: {answered} (Correct: {correct}, Incorrect: {incorrect}),
    Correct/Answered: {answered ? Math.floor((correct/answered)*10000)/100 : 100}%, 
  </Card>
}

export default observer(Stats)
