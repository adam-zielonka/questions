import { createContext, useContext } from 'react'
import { observable, action, computed, decorate } from 'mobx'
import autoSave from './autoSave'
import { getStats, parseQuestion, shuffle, hashCode, download } from './utils/Utils'

export class Store {

  constructor() {
    // Assignment preserves MobX 5's decorated prototype setters.
    this.questions = []
    this.settings = { showAll: false }
    this.filters = { buttons: false, hidden: true, danger: true, others: true }
    this.checkVisibility = this.checkVisibility.bind(this)
    autoSave(this)
  }

  get length() {
    return this.questions.length
  }

  get stats() {
    return getStats(this.questions)
  }

  get index() {
    for (let i = 0; i < this.questions.length; i++) {
      if(this.questions[i].active) return i
    }
    return 0
  }

  checkVisibility(question) {
    const flagged = question.hidden || question.danger
    return ((this.filters.hidden && question.hidden) || (this.filters.danger && question.danger) || (this.filters.others && !flagged))
  }

  get filteredQuestions() {
    return this.questions.slice().filter(q => this.checkVisibility(q))
  }

  setNextIndex() {
    this.navigate(1)
  }

  setBackIndex() {
    this.navigate(-1)
  }

  navigate(direction) {
    const visible = this.filteredQuestions
    if(!visible.length) return
    const current = visible.indexOf(this.questions[this.index])
    const next = current < 0 ? 0 : (current + direction + visible.length) % visible.length
    this.setIndex(this.questions.indexOf(visible[next]))
  }

  setFilter(name) {
    this.filters[name] = !this.filters[name]
    this.ensureVisibleQuestion()
  }

  ensureVisibleQuestion() {
    if(this.filteredQuestions.length && !this.checkVisibility(this.questions[this.index])) {
      this.setIndex(this.questions.indexOf(this.filteredQuestions[0]))
    }
  }

  setHidden(question) {
    const found = this.questions.find(q => q.hash === question.hash)
    if(found) {
      found.hidden = !found.hidden
      if(found.hidden)
        found.danger = false
      this.ensureVisibleQuestion()
    }
  }

  setDanger(question) {
    const found = this.questions.find(q => q.hash === question.hash)
    if(found) {
      found.danger = !found.danger
      if(found.danger)
        found.hidden = false
      this.ensureVisibleQuestion()
    }
  }

  setFilters() {
    this.filters.buttons = !this.filters.buttons
  }

  loadQuestion(text) {
    this.questions.clear()
    const newQuestions = parseQuestion(text)
    this.questions.push(...newQuestions)
  }

  setIndex(index) {
    for (let i = 0; i < this.questions.length; i++) {
      const temp = i === index
      if(this.questions[i].active !== temp) {
        this.questions[i].active = temp
      }
    }
  }

  resetQuestions() {
    this.questions.forEach(q => {
      q.answered = false
      q.answers.forEach(a => {
        a.checked = false
      })
      shuffle(q.answers)
    })
  }

  loadQuestions(text) {
    const parsed = parseQuestion(text)
    if(!Array.isArray(parsed) || !parsed.length || parsed.some(q =>
      typeof q.question !== 'string' || !q.question.trim() || !Array.isArray(q.answers) || !q.answers.length ||
      q.answers.some(a => typeof a.value !== 'string' || typeof a.correct !== 'boolean')
    )) {
      throw new Error('This file has no valid questions. Choose a quiz JSON or TXT file.')
    }
    this.questions.clear()
    this.questions.push(...parsed.map(q => {
      if(!q.hash) q.hash = hashCode(JSON.stringify({q: q.question, a: q.answers}))
      return q
    }))
    this.filters.hidden = this.filters.danger = this.filters.others = true
    this.setIndex(0)
  }

  shuffleQuestion() {
    this.questions = shuffle(this.questions)
  }

  downloadDanger() {
    const str = JSON.stringify(this.questions.filter(q => q.danger))
    download('danger.json', str)
  }

}

decorate(Store, {
  questions: observable,
  settings: observable,
  filters: observable,
  length: computed,
  stats: computed,
  index: computed,
  filteredQuestions: computed,
  setNextIndex: action.bound,
  setBackIndex: action.bound,
  navigate: action.bound,
  setFilter: action.bound,
  ensureVisibleQuestion: action.bound,
  setHidden: action.bound,
  setDanger: action.bound,
  setFilters: action.bound,
  loadQuestion: action.bound,
  setIndex: action.bound,
  resetQuestions: action.bound,
  loadQuestions: action.bound,
  shuffleQuestion: action.bound,
  downloadDanger: action.bound,
})

const store = createContext(new Store())

export function useStore() {
  return useContext(store)
}
