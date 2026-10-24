import { Colors } from '@blueprintjs/core'

export function parseQuestion(text) {
  try {
    const json = JSON.parse(text)
    json.forEach(j => {
      j.answered = false
      j.answers.forEach(a => {
        a.checked = false
      })
      j.answers = shuffle(j.answers)
    })
    return json
  } catch (error) {
    return parseFromTXT(text)
  }
}

export function parseFromTXT(text) {
  const array = text.split('\r\n')
  const result = []
  let last
  for (const line of array) {
    switch (true) {
    case Boolean(line.match(/^###/)): {
      if(last) result.push(last)
      const question = line.match(/^###([0-9]+)\. (.*)/)
      last = {
        code: question[1],
        question: question[2],
        answers: [],
        answered: false,
      }
      break
    }
    case Boolean(line.match(/^\$\$/)): {
      if(last) {
        const answer = line.match(/^\$\$(.) (.*)$/)
        if(answer[2]) last.answers.push({
          correct: answer[1] === 'T',
          value: answer[2],
          checked: false,
        })
      }
      break
    }
    default:
    }
  }
  if(last) result.push(last)
  result.forEach(q => q.answers = shuffle(q.answers))
  return result
}

export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function isCorrect(question) {
  for (const answer of question.answers) {
    if(answer.correct !== answer.checked) return false
  }
  return true
}

export function getStats(questions) {
  let correct = 0, incorrect = 0, hidden = 0, danger = 0
  for (const question of questions) {
    if(question.answered) {
      if(isCorrect(question)) correct++
      else incorrect++
    }
    if(question.hidden) hidden++
    if(question.danger) danger++
  }
  return { all: questions.length, answered: correct+incorrect, correct, incorrect, hidden, danger }
}

export function getStyle(answer) {
  switch (true) {
  case answer.correct === true: return {
    color: Colors.BLACK,
    background: Colors.GREEN5,
  }
  case answer.correct === false && answer.checked === true: return {
    color: Colors.BLACK,
    background: Colors.RED5,
  }
  default: return {
    color: Colors.BLACK,
  }
  }
}

export function hashCode(str){
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    var character = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+character
    hash = hash & hash
  }
  return hash
}

export function download(filename, text) {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}
