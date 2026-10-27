import { it, expect } from 'vitest'
import { Store } from './Store'

it('preserves observable fields, computed filtering and bound actions without decorators', () => {
  localStorage.clear()
  const store = new Store()
  store.questions.replace([{ question: 'Regression', answers: [], hidden: false, danger: false }])
  expect(store.length).toBe(1)
  expect(store.filteredQuestions.length).toBe(1)
  store.filters.others = false
  expect(store.filteredQuestions.length).toBe(0)
  const { checkVisibility } = store
  expect(checkVisibility(store.questions[0])).toBe(false)
})

it('keeps navigation inside the visible questions and handles an empty filter', () => {
  localStorage.clear()
  const store = new Store()
  store.questions.replace([
    { hash: 1, question: 'Easy', answers: [], hidden: true },
    { hash: 2, question: 'Normal', answers: [] },
    { hash: 3, question: 'Difficult', answers: [], danger: true },
  ])
  store.setIndex(0)
  store.setFilter('hidden')
  expect(store.index).toBe(1)
  store.setNextIndex()
  expect(store.index).toBe(2)
  store.setNextIndex()
  expect(store.index).toBe(1)
  store.setBackIndex()
  expect(store.index).toBe(2)
  store.setFilter('danger')
  expect(store.index).toBe(1)
  store.setFilter('others')
  expect(store.filteredQuestions).toHaveLength(0)
  expect(() => { store.setNextIndex(); store.setBackIndex() }).not.toThrow()
})

it('keeps the existing quiz and progress when an import is invalid', () => {
  localStorage.clear()
  const store = new Store()
  store.questions[0].answered = true
  const before = JSON.stringify(store.questions)
  for(const invalid of ['invalid', '[]', '{}', '[{"question":"Broken","answers":[]}]']) {
    expect(() => store.loadQuestions(invalid)).toThrow()
    expect(JSON.stringify(store.questions)).toBe(before)
  }
})

it('imports a TXT quiz with Unix line endings and restores visible filters', () => {
  localStorage.clear()
  const store = new Store()
  store.filters.others = false
  store.loadQuestions('###1. A question\n$$T A correct answer\n$$F A wrong answer')
  expect(store.length).toBe(1)
  expect(store.filteredQuestions).toHaveLength(1)
  expect(store.questions[0].answers).toHaveLength(2)
  expect(store.questions[0].answered).toBe(false)
})
