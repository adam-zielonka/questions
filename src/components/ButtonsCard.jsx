import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import FileLoader from './FileLoader'
import { Button, Alert, Intent } from '@blueprintjs/core'
import Card from './Card'
import { useStore } from '../Store'

export const FiltersCard = observer(() => {
  const { filters, downloadDanger } = useStore()

  if(!filters.buttons) return ''

  return <Card>
    <Button text={'Easy'} active={filters.hidden} onClick={() => filters.hidden = !filters.hidden} />
    <Button text={'Normal'} active={filters.others} onClick={() => filters.others = !filters.others} />
    <Button text={'Danger'} active={filters.danger} onClick={() => filters.danger = !filters.danger} />
    <br />
    <Button text={'Download Danger'} icon='download' onClick={downloadDanger} />
  </Card>
})

function ButtonsCard() {
  const { settings, resetQuestions, setFilters, filters, shuffleQuestion } = useStore()

  const [alert, setAlert] = useState(false)
  const [alert2, setAlert2] = useState(false)

  return <Card>
    <FileLoader/>
    <Button text='Reset' icon='reset' onClick={() => setAlert(true)} />
    <Button text='List' icon='list' onClick={() => settings.showAll = !settings.showAll} active={settings.showAll} />
    <Alert
      cancelButtonText="Cancel"
      confirmButtonText="Clear"
      icon="trash"
      intent={Intent.DANGER}
      isOpen={alert}
      onCancel={() => setAlert(false)}
      onConfirm={() => {resetQuestions(); setAlert(false)}}
      canEscapeKeyCancel
      canOutsideClickCancel
    >Are you sure to clear your progress?</Alert>
    <Button icon='filter' onClick={setFilters} active={filters.buttons} intent={(filters.others && filters.hidden && filters.danger) ? 'none' : 'success'} />
    <Button icon='refresh' text="Shuffle" onClick={() => setAlert2(true)}  />
    <Alert
      cancelButtonText="Cancel"
      confirmButtonText="Shuffle"
      icon="trash"
      intent={Intent.DANGER}
      isOpen={alert2}
      onCancel={() => setAlert2(false)}
      onConfirm={() => {shuffleQuestion(); setAlert2(false)}}
      canEscapeKeyCancel
      canOutsideClickCancel
    >Are you sure to shuffle questions?</Alert>
  </Card>
}

export default observer(ButtonsCard)
