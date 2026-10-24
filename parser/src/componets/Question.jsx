import React from 'react'
import { observer } from 'mobx-react-lite'
import { Card, Checkbox, Colors } from '@blueprintjs/core'

function Question({ value }) {

  function getStyle(answer) {
    switch (true) {
    case answer.correct === true: return {
      color: Colors.BLACK,
      background: Colors.GREEN5,
    }
    default: return {
      color: Colors.BLACK,
    }
    }
  }

  return <Card>
    <div dangerouslySetInnerHTML={{ __html: value.question }} />
    {value.answers.map(answer => <Checkbox 
      key={answer.value}
      label={answer.value}
      checked={answer.checked}
      disabled={true}
      style={getStyle(answer)}
    />)}
  </Card>
}

export default observer(Question)
