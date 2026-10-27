import React, { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Alert, Button, Intent } from '@blueprintjs/core'
import { useStore } from '../Store'

function FileLoader() {
  const { loadQuestions, length } = useStore()
  const input = useRef(null)
  const [pending, setPending] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  async function importFile(file) {
    setPending(null)
    setLoading(true)
    try {
      const text = await file.text()
      loadQuestions(text)
      setMessage({ error: false, text: `Loaded ${file.name}. Your new quiz is ready.` })
    } catch (error) {
      setMessage({ error: true, text: 'Could not open this quiz. Choose a valid JSON or TXT question file. Your current progress is safe.' })
    } finally {
      setLoading(false)
    }
  }

  return <>
    <input ref={input} className="visually-hidden" type="file" accept=".json,.txt,application/json,text/plain" tabIndex={-1} aria-label="Choose a quiz file" onChange={event => {
      const file = event.target.files[0]
      event.target.value = ''
      if(file) { if(length) setPending(file); else importFile(file) }
    }}/>
    <Button icon="folder-open" text="Open quiz" loading={loading} onClick={() => input.current.click()}/>
    {message && <div className={`import-message ${message.error ? 'is-error' : ''}`} role={message.error ? 'alert' : 'status'}><span>{message.text}</span><Button minimal icon="cross" aria-label="Dismiss import message" onClick={() => setMessage(null)}/></div>}
    <Alert isOpen={pending !== null} icon="folder-open" intent={Intent.PRIMARY} cancelButtonText="Keep current quiz" confirmButtonText="Open new quiz" onCancel={() => setPending(null)} onConfirm={() => importFile(pending)} canEscapeKeyCancel canOutsideClickCancel>
      <h3>Open a different quiz?</h3><p>This replaces your current questions and progress with {pending && pending.name}. Export any difficult questions you want to keep first.</p>
    </Alert>
  </>
}

export default observer(FileLoader)
