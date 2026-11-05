import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Button, ConfirmDialog, Icon, Modal } from './UI'
import { useStore } from '../Store'
import demoQuestions from '../assets/questions.json'

function FileLoader({ children }) {
  const { loadQuestions, length } = useStore()
  const loader = useRef(null)
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

  useLayoutEffect(() => {
    if(menuOpen) menu.current.querySelectorAll('[role="menuitem"]')[firstMenuItem.current].focus()
  }, [menuOpen])

  useEffect(() => {
    if(!menuOpen) return
    const dismiss = event => {
      if(!loader.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', dismiss)
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
    trigger.current.focus()
  }

  function requestImport(source) {
    closeMenu()
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
    <div className="toolbar-actions">
      {children}
      <input ref={input} className="visually-hidden" type="file" accept=".json,.txt,application/json,text/plain" tabIndex={-1} aria-label="Choose a quiz file" onChange={event => {
        const file = event.target.files[0]
        event.target.value = ''
        if(file) requestImport({ type: 'file', file, name: file.name })
      }}/>
      <div className="quiz-loader" ref={loader}>
        <Button ref={trigger} icon="folder-open" rightIcon="caret-down" text="Open quiz" intent="primary" loading={loading} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? 'quiz-source-menu' : undefined} onClick={() => {
          firstMenuItem.current = 0
          setMenuOpen(!menuOpen)
        }} onKeyDown={event => {
          if(event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            firstMenuItem.current = event.key === 'ArrowUp' ? 2 : 0
            setMenuOpen(true)
          }
        }}/>
        {menuOpen && <ul id="quiz-source-menu" className="quiz-source-menu" ref={menu} role="menu" aria-label="Quiz source" onKeyDown={navigateMenu}>
          <li role="none"><button type="button" role="menuitem" tabIndex={-1} onClick={() => requestImport({ type: 'demo', name: 'the 50-question demo quiz' })}><Icon icon="learning"/>Load demo quiz</button></li>
          <li role="none"><button type="button" role="menuitem" tabIndex={-1} onClick={() => { closeMenu(); setUrlError(null); setUrlDialogOpen(true) }}><Icon icon="link"/>Load from URL</button></li>
          <li role="none"><button type="button" role="menuitem" tabIndex={-1} onClick={() => { closeMenu(); input.current.click() }}><Icon icon="folder-open"/>Load from file</button></li>
        </ul>}
      </div>
    </div>
    {loading && <div className="import-message" role="status">Loading quiz…</div>}
    {message && <div className={`import-message ${message.error ? 'is-error' : ''}`} role={message.error ? 'alert' : 'status'}><span>{message.text}</span><Button minimal icon="cross" aria-label="Dismiss import message" onClick={() => setMessage(null)}/></div>}
    <Modal id="quiz-url-dialog" className="quiz-url-dialog" isOpen={urlDialogOpen} title="Load quiz from URL" onClose={() => setUrlDialogOpen(false)} initialFocus="#quiz-url">
      <form onSubmit={submitUrl}>
        <div className="ui-dialog-body">
          <label className="ui-label" htmlFor="quiz-url">Quiz URL</label>
          <input className="ui-input" id="quiz-url" type="url" value={url} onChange={event => { setUrl(event.target.value); setUrlError(null) }} placeholder="https://example.com/questions.json" required autoComplete="url" spellCheck={false} aria-invalid={Boolean(urlError)} aria-describedby="quiz-url-format quiz-url-help"/>
          <p id="quiz-url-format" className={urlError ? 'field-error' : undefined} role={urlError ? 'alert' : undefined}>{urlError || 'Use a direct link to a JSON or TXT quiz. The server must allow cross-origin requests.'}</p>
          <p id="quiz-url-help">{length ? 'Loading a new quiz replaces your current questions and progress. You will be asked to confirm.' : 'Your quiz will be loaded into this browser.'}</p>
        </div>
        <footer className="ui-dialog-footer">
          <Button text="Cancel" onClick={() => setUrlDialogOpen(false)}/>
          <Button type="submit" intent="primary" text="Load quiz"/>
        </footer>
      </form>
    </Modal>
    <ConfirmDialog id="replace-quiz" isOpen={pending !== null} title="Open a different quiz?" cancelText="Keep current quiz" confirmText="Open new quiz" onCancel={() => setPending(null)} onConfirm={() => importQuiz(pending)}>
      <p>This replaces your current questions and progress with {pending && pending.name}. Export any difficult questions you want to keep first.</p>
    </ConfirmDialog>
  </>
}

export default observer(FileLoader)
