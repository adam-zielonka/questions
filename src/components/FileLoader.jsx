import React from 'react'
import { observer } from 'mobx-react-lite'
import { Button } from '@blueprintjs/core'
import { useStore } from '../Store'

function loadFile(onLoad) {
  const input = document.createElement('input')
  input.setAttribute('type','file')
  input.onchange = (event) => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => onLoad(fileReader.result)
    fileReader.readAsText(event.target.files[0])
  }
  input.click()
}

function FileLoader() {
  const { loadQuestions } = useStore()
  return <Button icon='folder-open' onClick={() => loadFile(loadQuestions)} />
}

export default observer(FileLoader)
