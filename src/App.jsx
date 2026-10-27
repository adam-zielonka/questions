import React from 'react'
import { useStore } from './Store'
import { observer } from 'mobx-react-lite'
import { Button, Icon } from '@blueprintjs/core'
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
    <div className="section-heading"><h2>{settings.showAll ? 'All questions' : 'Practice'}</h2><span>{settings.showAll ? `${filteredQuestions.length} in this view` : 'One question at a time'}</span></div>
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
    <header className="app-header">
      <a className="brand" href="./" aria-label="Questions home"><span className="brand-mark"><Icon icon="learning" size={23}/></span><span>Questions<span className="brand-caption">A little practice. A little progress.</span></span></a>
      <span className="save-note"><Icon icon="saved" size={14}/> Progress saved on this device</span>
    </header>
    <div className="intro"><p className="eyebrow">YOUR STUDY SPACE</p><h1>Make it stick.</h1><p>Take your time, test what you know, and keep learning.</p></div>
    <Stats/>
    <ButtonsCard/>
    <FiltersCard/>
    <div className="study-layout"><StudyContent/><QuestionsBar/></div>
    <About/>
  </div>
}

export default App
