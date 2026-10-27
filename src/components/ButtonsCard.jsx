import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import FileLoader from './FileLoader'
import { Button, Alert, Intent } from '@blueprintjs/core'
import { useStore } from '../Store'

export const FiltersCard = observer(() => {
  const { filters, setFilter, downloadDanger, stats } = useStore()
  if(!filters.buttons) return null
  return <section id="question-filters" className="filter-panel" aria-label="Filter questions">
    <span className="filter-label">Include difficulty</span>
    <div className="filter-options">
      <Button text={`Easy · ${stats.hidden}`} active={filters.hidden} aria-pressed={filters.hidden} onClick={() => setFilter('hidden')}/>
      <Button text={`Normal · ${stats.all - stats.hidden - stats.danger}`} active={filters.others} aria-pressed={filters.others} onClick={() => setFilter('others')}/>
      <Button text={`Difficult · ${stats.danger}`} active={filters.danger} aria-pressed={filters.danger} onClick={() => setFilter('danger')}/>
    </div>
    <Button className="export-button" minimal text="Export difficult" icon="download" disabled={!stats.danger} onClick={downloadDanger}/>
  </section>
})

function ButtonsCard() {
  const { settings, resetQuestions, setFilters, filters, shuffleQuestion, length } = useStore()
  const [dialog, setDialog] = useState(null)
  const filtered = !(filters.others && filters.hidden && filters.danger)
  return <div className="toolbar">
    <div className="view-switch" role="group" aria-label="Question view">
      <Button icon="learning" text="Practice" active={!settings.showAll} aria-pressed={!settings.showAll} onClick={() => settings.showAll = false}/>
      <Button icon="list" text="All questions" active={settings.showAll} aria-pressed={settings.showAll} onClick={() => settings.showAll = true}/>
    </div>
    <div className="toolbar-actions">
      <Button icon="filter" text={filtered ? 'Filters · active' : 'Filters'} active={filters.buttons} aria-expanded={filters.buttons} aria-controls="question-filters" onClick={setFilters}/>
      <Button icon="random" text="Shuffle" disabled={length < 2} onClick={() => setDialog('shuffle')}/>
      <Button icon="reset" text="Reset" disabled={!length} onClick={() => setDialog('reset')}/>
      <FileLoader/>
    </div>
    <Alert cancelButtonText="Cancel" confirmButtonText={dialog === 'reset' ? 'Reset answers' : 'Shuffle questions'} icon={dialog === 'reset' ? 'reset' : 'random'} intent={dialog === 'reset' ? Intent.DANGER : Intent.PRIMARY} isOpen={dialog !== null} onCancel={() => setDialog(null)} onConfirm={() => { dialog === 'reset' ? resetQuestions() : shuffleQuestion(); setDialog(null) }} canEscapeKeyCancel canOutsideClickCancel>
      <h3>{dialog === 'reset' ? 'Start a fresh attempt?' : 'Change the question order?'}</h3>
      <p>{dialog === 'reset' ? 'Your answers and results will be cleared. Your questions and difficulty labels will stay.' : 'Questions will appear in a new, random order. Your answers and progress will stay.'}</p>
    </Alert>
  </div>
}

export default observer(ButtonsCard)
