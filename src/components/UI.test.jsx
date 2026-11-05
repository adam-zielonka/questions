import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { Button, ConfirmDialog } from './UI'

let root
let confirmed
function Example() {
  const [open, setOpen] = useState(false)
  return <>
    <Button text="Reset" onClick={() => setOpen(true)}/>
    <ConfirmDialog id="test-reset" isOpen={open} title="Clear answers?" confirmText="Clear" onCancel={() => setOpen(false)} onConfirm={() => { confirmed++; setOpen(false) }}>
      <p>Your questions will stay.</p>
    </ConfirmDialog>
  </>
}
const button = text => [...document.querySelectorAll('button')].find(el => el.textContent === text)
const open = () => act(() => { button('Reset').focus(); button('Reset').click() })

beforeEach(() => {
  confirmed = 0
  root = document.createElement('div')
  document.body.appendChild(root)
  act(() => ReactDOM.render(<Example/>, root))
})
afterEach(() => {
  act(() => ReactDOM.unmountComponentAtNode(root))
  root.remove()
})

it('names the confirmation, focuses cancel and wraps keyboard focus inside the dialog', () => {
  open()
  const dialog = document.querySelector('dialog')
  expect(dialog.open).toBe(true)
  expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toBe('Clear answers?')
  expect(document.getElementById(dialog.getAttribute('aria-describedby')).textContent).toBe('Your questions will stay.')
  expect(document.activeElement).toBe(button('Cancel'))
  expect(document.body.style.overflow).toBe('hidden')
  const close = dialog.querySelector('[aria-label="Close dialog"]')
  act(() => { button('Clear').focus(); Simulate.keyDown(button('Clear'), { key: 'Tab' }) })
  expect(document.activeElement).toBe(close)
  act(() => Simulate.keyDown(close, { key: 'Tab', shiftKey: true }))
  expect(document.activeElement).toBe(button('Clear'))
})

it.each(['cancel', 'escape', 'backdrop', 'close'])('dismisses via %s without confirming and restores focus', method => {
  open()
  act(() => {
    const dialog = document.querySelector('dialog')
    if(method === 'cancel') button('Cancel').click()
    if(method === 'escape') dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    if(method === 'backdrop') dialog.click()
    if(method === 'close') dialog.querySelector('[aria-label="Close dialog"]').click()
  })
  expect(document.querySelector('dialog')).toBeNull()
  expect(confirmed).toBe(0)
  expect(document.activeElement).toBe(button('Reset'))
  expect(document.body.style.overflow).toBe('')
})

it('only confirms after the explicit action and keeps content clicks inside the dialog', () => {
  open()
  act(() => document.querySelector('.ui-dialog-body').click())
  expect(document.querySelector('dialog')).not.toBeNull()
  act(() => button('Clear').click())
  expect(confirmed).toBe(1)
  expect(document.querySelector('dialog')).toBeNull()
  expect(document.activeElement).toBe(button('Reset'))
})
