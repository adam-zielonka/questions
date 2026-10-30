import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { Store } from '../Store'
import QuestionsBar from './QuestionsBar'

const context = vi.hoisted(() => ({ store: null }))
vi.mock('../Store', async importOriginal => ({ ...await importOriginal(), useStore: () => context.store }))

let root
beforeEach(() => {
  localStorage.clear()
  context.store = new Store()
  context.store.questions.replace([
    { hash: 'demo-correct', question: 'DEMO correct', answered: true, answers: [{ value: 'DEMO yes', correct: true, checked: true }] },
    { hash: 'demo-incorrect', question: 'DEMO incorrect', answered: true, danger: true, answers: [{ value: 'DEMO yes', correct: true, checked: false }] },
    { hash: 'demo-unanswered', question: 'DEMO unanswered', answered: false, answers: [{ value: 'DEMO yes', correct: true, checked: false }] },
  ])
  root = document.createElement('div')
  root.id = 'practice'
  root.tabIndex = -1
  document.body.appendChild(root)
  act(() => ReactDOM.render(<QuestionsBar/>, root))
})
afterEach(() => {
  act(() => ReactDOM.unmountComponentAtNode(root))
  root.remove()
})

it('shows each answer state independently of color and uses the same symbols in the legend', () => {
  expect([...root.querySelectorAll('.question-number .question-state')].map(el => el.textContent)).toEqual(['✓', '×', '—'])
  expect([...root.querySelectorAll('.map-legend .question-state')].map(el => el.textContent)).toEqual(['✓', '×', '—'])
  expect([...root.querySelectorAll('.question-index')].map(el => el.textContent)).toEqual(['1', '2', '3'])
  expect(root.querySelector('[aria-current="step"]').getAttribute('aria-label')).toBe('Question 1, correct')
  expect(root.querySelector('.question-state').getAttribute('aria-hidden')).toBe('true')
  act(() => { context.store.questions[2].answered = true })
  expect(root.querySelectorAll('.question-number .question-state')[2].textContent).toBe('×')
  act(() => { context.store.questions[2].answers[0].checked = true })
  expect(root.querySelectorAll('.question-number .question-state')[2].textContent).toBe('✓')
})

it('keeps active state separate from answer state, filtering and showAll navigation', () => {
  act(() => { context.store.settings.showAll = true })
  expect(root.querySelector('[aria-current]')).toBeNull()
  act(() => root.querySelector('.question-number.incorrect').click())
  expect(context.store.settings.showAll).toBe(false)
  expect(root.querySelector('[aria-current="step"]').getAttribute('aria-label')).toBe('Question 2, incorrect answer')
  expect(document.activeElement).toBe(root)
  act(() => context.store.setFilter('others'))
  expect(root.querySelectorAll('.question-number')).toHaveLength(1)
  expect(root.querySelector('.question-index').textContent).toBe('2')
  expect(root.querySelector('.question-state').textContent).toBe('×')
  act(() => context.store.setFilter('danger'))
  expect(root.querySelectorAll('.question-number')).toHaveLength(0)
  expect(root.querySelector('.map-empty').textContent).toContain('Adjust your filters')
})
