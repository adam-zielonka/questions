import React from 'react'
import ReactDOM from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { Store } from '../Store'
import FileLoader from './FileLoader'
import demoQuestions from '../assets/questions.json'

const context = vi.hoisted(() => ({ store: null }))
vi.mock('../Store', async importOriginal => ({ ...await importOriginal(), useStore: () => context.store }))

let root
const importedQuiz = [{ question: 'A new quiz', answers: [{ value: 'Yes', correct: true }, { value: 'No', correct: false }] }]
const button = text => [...document.querySelectorAll('button')].find(el => el.textContent === text)
const click = text => act(() => button(text).click())

beforeEach(() => {
  localStorage.clear()
  context.store = new Store()
  context.store.questions.replace([
    { hash: 1, question: 'Keep my progress', answered: true, danger: true, answers: [{ value: 'Saved answer', correct: true, checked: true }] },
  ])
  root = document.createElement('div')
  document.body.appendChild(root)
  act(() => ReactDOM.render(<FileLoader/>, root))
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  act(() => ReactDOM.unmountComponentAtNode(root))
  root.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function submitUrl(url = 'https://example.com/quiz.json') {
  click('Open quiz')
  click('Load from URL')
  act(() => {
    Simulate.change(document.getElementById('quiz-url'), { target: { value: url } })
  })
  act(() => Simulate.submit(document.querySelector('.quiz-url-dialog form')))
}

it('opens a three-option menu and supports keyboard navigation', async () => {
  click('Open quiz')
  const menu = document.querySelector('[role="menu"]')
  const items = [...menu.querySelectorAll('[role="menuitem"]')]
  expect(items.map(el => el.textContent)).toEqual(['Load demo quiz', 'Load from URL', 'Load from file'])
  expect(button('Open quiz').getAttribute('aria-expanded')).toBe('true')
  await vi.waitFor(() => expect(document.activeElement).toBe(items[0]))
  act(() => Simulate.keyDown(menu, { key: 'ArrowUp' }))
  expect(document.activeElement).toBe(items[2])
  act(() => Simulate.keyDown(menu, { key: 'ArrowDown' }))
  expect(document.activeElement).toBe(items[0])
  act(() => Simulate.keyDown(menu, { key: 'End' }))
  expect(document.activeElement).toBe(items[2])
  act(() => Simulate.keyDown(menu, { key: 'Home' }))
  expect(document.activeElement).toBe(items[0])
  act(() => Simulate.keyDown(menu, { key: 'Escape' }))
  expect(button('Open quiz').getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(button('Open quiz'))
})

it('allows cancelling replacement, then loads the full demo with fresh progress', async () => {
  const before = JSON.stringify(context.store.questions)
  click('Open quiz')
  click('Load demo quiz')
  expect(JSON.stringify(context.store.questions)).toBe(before)
  click('Keep current quiz')
  expect(JSON.stringify(context.store.questions)).toBe(before)
  click('Open quiz')
  click('Load demo quiz')
  await act(async () => button('Open new quiz').click())
  expect(context.store.length).toBe(demoQuestions.length)
  expect(context.store.stats.answered).toBe(0)
  expect(context.store.questions.every(q => q.answers.every(a => !a.checked))).toBe(true)
  expect(root.querySelector('[role="status"]').textContent).toContain('50-question demo')
  expect(fetch).not.toHaveBeenCalled()
})

it('opens the last menu item with ArrowUp and closes when focus or a pointer leaves', () => {
  const trigger = button('Open quiz')
  act(() => { trigger.focus(); Simulate.keyDown(trigger, { key: 'ArrowUp' }) })
  expect(document.activeElement).toBe(button('Load from file'))
  act(() => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })))
  expect(document.querySelector('[role="menu"]')).toBeNull()
  click('Open quiz')
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  act(() => outside.focus())
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(document.activeElement).toBe(outside)
  outside.remove()
})

it('focuses the URL field, then safely transfers focus to the replacement prompt', () => {
  click('Open quiz')
  click('Load from URL')
  expect(document.activeElement).toBe(document.getElementById('quiz-url'))
  act(() => Simulate.change(document.getElementById('quiz-url'), { target: { value: 'https://example.com/quiz.json' } }))
  act(() => Simulate.submit(document.querySelector('.quiz-url-dialog form')))
  expect(document.querySelectorAll('dialog')).toHaveLength(1)
  expect(document.activeElement).toBe(button('Keep current quiz'))
  click('Keep current quiz')
  expect(document.activeElement).toBe(button('Open quiz'))
  expect(document.body.style.overflow).toBe('')
})

it('waits for confirmation and a successful URL response before replacing progress', async () => {
  let resolveRequest
  fetch.mockImplementation(() => new Promise(resolve => { resolveRequest = resolve }))
  const before = JSON.stringify(context.store.questions)
  submitUrl()
  expect(fetch).not.toHaveBeenCalled()
  await act(async () => button('Open new quiz').click())
  expect(fetch).toHaveBeenCalledWith('https://example.com/quiz.json')
  expect(button('Open quiz').disabled).toBe(true)
  expect(root.querySelector('[role="status"]').textContent).toBe('Loading quiz…')
  expect(JSON.stringify(context.store.questions)).toBe(before)
  await act(async () => resolveRequest({ ok: true, text: async () => JSON.stringify(importedQuiz) }))
  expect(context.store.questions[0].question).toBe('A new quiz')
  expect(context.store.stats.answered).toBe(0)
  expect(button('Open quiz').disabled).toBe(false)
  expect(root.querySelector('[role="status"]').textContent).toContain('Your new quiz is ready')
})

it.each(['network', 'http', 'invalid quiz'])('preserves the quiz and progress after a %s URL failure', async failure => {
  const before = JSON.stringify(context.store.questions)
  if(failure === 'network') fetch.mockRejectedValue(new TypeError('Failed to fetch'))
  else fetch.mockResolvedValue({ ok: failure !== 'http', text: async () => '<html>Not a quiz</html>' })
  submitUrl()
  await act(async () => button('Open new quiz').click())
  expect(JSON.stringify(context.store.questions)).toBe(before)
  expect(root.querySelector('[role="alert"]').textContent).toContain('Your current progress is safe')
  expect(button('Open quiz').disabled).toBe(false)
})

it('rejects non-HTTP URLs before making a request', () => {
  const before = JSON.stringify(context.store.questions)
  submitUrl('ftp://example.com/quiz.json')
  expect(document.getElementById('quiz-url').getAttribute('aria-invalid')).toBe('true')
  expect(document.querySelector('.quiz-url-dialog').textContent).toContain('http:// or https://')
  expect(button('Open new quiz')).toBeUndefined()
  expect(fetch).not.toHaveBeenCalled()
  expect(JSON.stringify(context.store.questions)).toBe(before)
})

it('loads a TXT quiz from a URL without a replacement prompt when the quiz is empty', async () => {
  act(() => { context.store.questions.clear() })
  fetch.mockResolvedValue({ ok: true, text: async () => '###1. TXT from URL\n$$T Correct\n$$F Wrong' })
  submitUrl('https://example.com/quiz.txt')
  await act(async () => {})
  expect(button('Open new quiz')).toBeUndefined()
  expect(context.store.questions[0].question).toBe('TXT from URL')
  expect(context.store.questions[0].answers).toHaveLength(2)
})

it('opens the file picker and keeps file import behind replacement confirmation', async () => {
  const input = root.querySelector('input[type="file"]')
  const openPicker = vi.spyOn(input, 'click').mockImplementation(() => {})
  const file = { name: 'local.json', text: vi.fn().mockResolvedValue(JSON.stringify(importedQuiz)) }
  click('Open quiz')
  click('Load from file')
  expect(openPicker).toHaveBeenCalledOnce()
  act(() => Simulate.change(input, { target: { files: [file], value: 'local.json' } }))
  expect(file.text).not.toHaveBeenCalled()
  expect(document.querySelector('[role="alertdialog"]').textContent).toContain('local.json')
  await act(async () => button('Open new quiz').click())
  expect(context.store.questions[0].question).toBe('A new quiz')
  expect(root.querySelector('[role="status"]').textContent).toContain('Loaded local.json')
  expect(fetch).not.toHaveBeenCalled()
})
