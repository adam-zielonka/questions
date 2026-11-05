import React, { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Only the icons used by this app; no icon font or runtime dependency.
const paths = {
  learning: 'm2 8 10-5 10 5-10 5L2 8m4 2v7c4 3 8 3 12 0v-7m4-2v8',
  list: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
  filter: 'M3 4h18l-7 8v7l-4 2v-9L3 4Z',
  random: 'M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 3M3 19h3c2 0 4-3 5-6m2-2c2-4 3-6 5-6h3m-4-3 4 3-4 4',
  reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  'folder-open': 'M3 10V5h6l2 3h9v3M2 11h20l-4 9H5l-3-9Z',
  'caret-down': 'm6 9 6 6 6-6',
  link: 'm10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1',
  cross: 'm6 6 12 12M18 6 6 18',
  tick: 'm4 12 5 5L20 6',
  'tick-circle': 'M22 12a10 10 0 1 1-10-10 10 10 0 0 1 10 10Zm-16 0 4 4 8-8',
  'info-sign': 'M22 12a10 10 0 1 1-10-10 10 10 0 0 1 10 10ZM12 11v6m0-10v.01',
  'arrow-left': 'M20 12H4m7-7-7 7 7 7',
  'arrow-right': 'M4 12h16m-7-7 7 7-7 7',
  flag: 'M5 22V3c5-3 9 3 14 0v11c-5 3-9-3-14 0',
  search: 'M19 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-2 6 5 6',
  lightbulb: 'M9 18h6m-6 3h6M8 15a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z',
}

export function Icon({ icon, size = 16 }) {
  if(!paths[icon]) return null
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[icon]}/></svg>
}

export const Button = React.forwardRef(function Button({ text, children, icon, rightIcon, active, minimal, small, intent, loading, disabled, className = '', type = 'button', ...props }, ref) {
  const classes = ['ui-button', active && 'is-active', minimal && 'is-minimal', small && 'is-small', intent && `intent-${intent}`, className].filter(Boolean).join(' ')
  return <button {...props} ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading ? <span className="ui-spinner" aria-hidden="true"/> : <Icon icon={icon}/>}
    {(text != null || children != null) && <span className="ui-button-text">{text == null ? children : text}</span>}
    <Icon icon={rightIcon}/>
  </button>
})

function OpenModal({ id, title, children, onClose, className = '', initialFocus, role = 'dialog', describedBy }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    const target = initialFocus && dialog.querySelector(initialFocus)
    if(target) target.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if(opener && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  function trapFocus(event) {
    if(event.key !== 'Tab') return
    const items = [...ref.current.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"], a[href]')]
    const first = items[0], last = items[items.length - 1]
    if(event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if(!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(<dialog ref={ref} className={`ui-dialog ${className}`} role={role} aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={describedBy} onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={trapFocus} onClick={event => { if(event.target === event.currentTarget) onClose() }}>
    <div className="ui-dialog-content">
      <header className="ui-dialog-header"><h2 id={`${id}-title`}>{title}</h2><Button minimal icon="cross" aria-label="Close dialog" onClick={onClose}/></header>
      {children}
    </div>
  </dialog>, document.body)
}

export function Modal({ isOpen, ...props }) {
  return isOpen ? <OpenModal {...props}/> : null
}

export function ConfirmDialog({ id, isOpen, title, children, onCancel, onConfirm, confirmText, cancelText = 'Cancel', intent = 'primary' }) {
  return <Modal id={id} isOpen={isOpen} title={title} role="alertdialog" describedBy={`${id}-description`} onClose={onCancel} initialFocus="[data-cancel]">
    <div id={`${id}-description`} className="ui-dialog-body">{children}</div>
    <footer className="ui-dialog-footer"><Button data-cancel text={cancelText} onClick={onCancel}/><Button intent={intent} text={confirmText} onClick={onConfirm}/></footer>
  </Modal>
}
