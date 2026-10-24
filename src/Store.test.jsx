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
