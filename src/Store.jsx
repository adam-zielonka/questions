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
    const index = this.index
    let newIndex = index
    do {
      newIndex = newIndex + 1 === this.questions.length ? 0 : newIndex + 1
      if(this.checkVisibility(this.questions[newIndex])) break
    } while(index !== newIndex)
    this.setIndex(newIndex)
  }

  setBackIndex() {
    const index = this.index
    let newIndex = index
    do {
      newIndex = newIndex === 0 ? this.questions.length - 1 : newIndex - 1
      if(this.checkVisibility(this.questions[newIndex])) break
    } while(index !== newIndex)
    this.setIndex(newIndex)
  }

  setHidden(question) {
    const found = this.questions.find(q => q.hash === question.hash)
    if(found) {
      found.hidden = !found.hidden
      if(found.hidden)
        found.danger = false
    }
  }

  setDanger(question) {
    const found = this.questions.find(q => q.hash === question.hash)
    if(found) {
      found.danger = !found.danger
      if(found.danger)
        found.hidden = false
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
    this.questions.clear()
    this.questions.push(...parseQuestion(text).map(q => {
      if(!q.hash) q.hash = hashCode(JSON.stringify({q: q.question, a: q.answers}))
      return q
    }))
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
  checkVisibility: action.bound,
  filteredQuestions: computed,
  setNextIndex: action.bound,
  setBackIndex: action.bound,
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
