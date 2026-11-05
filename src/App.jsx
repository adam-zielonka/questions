import React from 'react'
import { useStore } from './Store'
import { observer } from 'mobx-react-lite'
import { Button, Icon } from './components/UI'
import Question from './components/Question'
import Stats from './components/Stats'
import QuestionsBar from './components/QuestionsBar'
import ButtonsCard, { FiltersCard } from './components/ButtonsCard'
import QuestionsAll from './components/QuestionsAll'
import About from './components/About'

const StudyContent = observer(() => {
  const { questions, index, filteredQuestions, settings, length, filters } = useStore()
  const value = filteredQuestions.includes(questions[index]) ? questions[index] : filteredQuestions[0]
  return <main id="practice" tabIndex={-1}>
    <div className="section-heading"><h1>{settings.showAll ? 'All questions' : 'Practice'}</h1><span>{settings.showAll ? `${filteredQuestions.length} in this view` : 'One question at a time'}</span></div>
    {filteredQuestions.length ? (settings.showAll ? <QuestionsAll/> : <Question value={value}/>) : <section className="card empty-state">
      <Icon icon="search" size={28}/>
      <h2>{length ? 'No questions match your filters' : 'Your next study session starts here'}</h2>
      <p>{length ? 'Include another difficulty level to keep practicing.' : 'Open a quiz file to start learning. Your progress will be saved in this browser.'}</p>
      {length > 0 && <Button intent="primary" onClick={() => { filters.hidden = filters.others = filters.danger = true }}>Show all questions</Button>}
    </section>}
  </main>
})

function App() {
  return <div className="App">
    <a className="skip-link" href="#practice">Skip to questions</a>
    <ButtonsCard/>
    <FiltersCard/>
    <div className="study-layout"><StudyContent/><QuestionsBar/></div>
    <Stats/>
    <About/>
  </div>
}

export default App
