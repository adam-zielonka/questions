import React from 'react'
import { useStore } from './Store'
import { observer } from 'mobx-react-lite'
import Question from './components/Question'
import Stats from './components/Stats'
import QuestionsBar from './components/QuestionsBar'
import ButtonsCard, { FiltersCard } from './components/ButtonsCard'
import QuestionsAll from './components/QuestionsAll'
import About from './components/About'

const SelectedQuestion = observer(() => {
  const { questions, index } = useStore()
  return <Question value={questions.length && questions[index]}/>
})

function App() {

  return (
    <div className="App">
      <ButtonsCard/>
      <FiltersCard/>
      <Stats/>
      <SelectedQuestion/>
      <QuestionsBar/>
      <QuestionsAll/>
      <About/>
    </div>
  )
}

export default App
