import React, { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Alert, Button, Dialog, FormGroup, InputGroup, Intent, Menu, MenuItem, Popover } from '@blueprintjs/core'
import { useStore } from '../Store'
import demoQuestions from '../assets/questions.json'

function FileLoader() {
  const { loadQuestions, length } = useStore()
  const input = useRef(null)
  const menu = useRef(null)
  const trigger = useRef(null)
  const firstMenuItem = useRef(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(null)
  const [pending, setPending] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  function requestImport(source) {
    setMenuOpen(false)
    setMessage(null)
    if(length) setPending(source)
    else importQuiz(source)
  }

  async function importQuiz(source) {
    setPending(null)
    setLoading(true)
    setMessage(null)
    try {
      let text
      if(source.type === 'demo') {
        text = JSON.stringify(demoQuestions)
      } else if(source.type === 'url') {
        const response = await fetch(source.url)
        if(!response.ok) throw new Error('Quiz request failed')
        text = await response.text()
      } else {
        text = await source.file.text()
      }
      loadQuestions(text)
      setMessage({ error: false, text: `Loaded ${source.name}. Your new quiz is ready.` })
    } catch (error) {
      setMessage({ error: true, text: source.type === 'url'
        ? 'Could not load this URL. Check that it links directly to a valid JSON or TXT quiz and that the server allows cross-origin requests. Your current progress is safe.'
        : 'Could not open this quiz. Choose a valid JSON or TXT question file. Your current progress is safe.' })
    } finally {
      setLoading(false)
    }
  }

  function submitUrl(event) {
    event.preventDefault()
    let parsed
    try {
      parsed = new URL(url.trim())
      if(!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol')
    } catch (error) {
      setUrlError('Enter a complete http:// or https:// quiz URL.')
      return
    }
    setUrlError(null)
    setUrlDialogOpen(false)
    requestImport({ type: 'url', url: parsed.href, name: parsed.href })
  }

  function navigateMenu(event) {
    const items = [...menu.current.querySelectorAll('[role="menuitem"]')]
    const index = items.indexOf(document.activeElement)
    let next
    if(event.key === 'ArrowDown') next = (index + 1) % items.length
    else if(event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
    else if(event.key === 'Home') next = 0
    else if(event.key === 'End') next = items.length - 1
    else if(event.key === 'Tab' || event.key === 'Escape') {
      setMenuOpen(false)
      trigger.current.focus()
      if(event.key === 'Escape') { event.preventDefault(); event.stopPropagation() }
      return
    }
    else return
    event.preventDefault()
    items[next].focus()
  }

  return <>
    <input ref={input} className="visually-hidden" type="file" accept=".json,.txt,application/json,text/plain" tabIndex={-1} aria-label="Choose a quiz file" onChange={event => {
      const file = event.target.files[0]
      event.target.value = ''
      if(file) requestImport({ type: 'file', file, name: file.name })
    }}/>
    <Popover className="quiz-loader" position="bottom-right" minimal isOpen={menuOpen} onInteraction={open => { firstMenuItem.current = 0; setMenuOpen(open) }} disabled={loading} onOpened={() => { if(menu.current) menu.current.querySelectorAll('[role="menuitem"]')[firstMenuItem.current].focus() }} content={
      <Menu className="quiz-source-menu" ulRef={menu} role="menu" aria-label="Quiz source" onKeyDown={navigateMenu}>
        <MenuItem tagName="button" role="menuitem" icon="learning" text="Load demo quiz" onClick={() => requestImport({ type: 'demo', name: 'the 50-question demo quiz' })}/>
        <MenuItem tagName="button" role="menuitem" icon="link" text="Load from URL" onClick={() => { setMenuOpen(false); setUrlError(null); setUrlDialogOpen(true) }}/>
        <MenuItem tagName="button" role="menuitem" icon="folder-open" text="Load from file" onClick={() => { setMenuOpen(false); input.current.click() }}/>
      </Menu>
    }>
      <Button elementRef={trigger} icon="folder-open" rightIcon="caret-down" text="Open quiz" intent={Intent.PRIMARY} loading={loading} aria-haspopup="menu" aria-expanded={menuOpen} onKeyDown={event => {
        if(event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          firstMenuItem.current = event.key === 'ArrowUp' ? 2 : 0
          setMenuOpen(true)
        }
      }}/>
    </Popover>
    {loading && <div className="import-message" role="status">Loading quiz…</div>}
    {message && <div className={`import-message ${message.error ? 'is-error' : ''}`} role={message.error ? 'alert' : 'status'}><span>{message.text}</span><Button minimal icon="cross" aria-label="Dismiss import message" onClick={() => setMessage(null)}/></div>}
    <Dialog className="quiz-url-dialog" isOpen={urlDialogOpen} title="Load quiz from URL" icon="link" onClose={() => setUrlDialogOpen(false)}>
      <form onSubmit={submitUrl}>
        <div className="bp3-dialog-body">
          <FormGroup label="Quiz URL" labelFor="quiz-url" intent={urlError ? Intent.DANGER : Intent.NONE} helperText={<span id="quiz-url-format" role={urlError ? 'alert' : undefined}>{urlError || 'Use a direct link to a JSON or TXT quiz. The server must allow cross-origin requests.'}</span>}>
            <InputGroup id="quiz-url" type="url" value={url} onChange={event => { setUrl(event.target.value); setUrlError(null) }} placeholder="https://example.com/questions.json" required autoFocus autoComplete="url" spellCheck={false} aria-invalid={Boolean(urlError)} aria-describedby="quiz-url-format quiz-url-help"/>
          </FormGroup>
          <p id="quiz-url-help">{length ? 'Loading a new quiz replaces your current questions and progress. You will be asked to confirm.' : 'Your quiz will be loaded into this browser.'}</p>
        </div>
        <div className="bp3-dialog-footer"><div className="bp3-dialog-footer-actions">
          <Button text="Cancel" onClick={() => setUrlDialogOpen(false)}/>
          <Button type="submit" intent={Intent.PRIMARY} text="Load quiz"/>
        </div></div>
      </form>
    </Dialog>
    <Alert isOpen={pending !== null} icon="folder-open" intent={Intent.PRIMARY} cancelButtonText="Keep current quiz" confirmButtonText="Open new quiz" onCancel={() => setPending(null)} onConfirm={() => importQuiz(pending)} canEscapeKeyCancel canOutsideClickCancel>
      <h3>Open a different quiz?</h3><p>This replaces your current questions and progress with {pending && pending.name}. Export any difficult questions you want to keep first.</p>
    </Alert>
  </>
}

export default observer(FileLoader)
