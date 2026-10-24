import { autorun } from 'mobx'
import { hashCode, parseQuestion } from './utils/Utils.jsx'
import QUESTIONS from './assets/questions.json'

const STORAGE_QUESTIONS = 'questions'
const STORAGE_FILTERS = 'filters'
// const STORAGE_SETTINGS = 'settings'

export default function(_this) {
  let firstRun = true

  autorun(() => {
    if (firstRun) {
      const questions = JSON.parse(localStorage.getItem(STORAGE_QUESTIONS))
      const filters = JSON.parse(localStorage.getItem(STORAGE_FILTERS))
      // const settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS))
      if (questions && questions.length) {
        _this.questions = questions.map(q => {
          if(!q.hash) q.hash = hashCode(JSON.stringify({q: q.question, a: q.answers}))
          return q
        })
      } else {
        _this.questions = parseQuestion(JSON.stringify(QUESTIONS)).map(q => {
          if(!q.hash) q.hash = hashCode(JSON.stringify({q: q.question, a: q.answers}))
          return q
        })
      }
      if (filters) _this.filters = filters
      // if (settings) _this.settings = settings
    }

    localStorage.setItem(STORAGE_QUESTIONS, JSON.stringify(_this.questions))
    localStorage.setItem(STORAGE_FILTERS, JSON.stringify(_this.filters))
    // localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(_this.settings))
  })

  firstRun = false
}
