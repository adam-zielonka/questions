import React, { useState } from 'react'
import { observer, useObservable } from 'mobx-react-lite'
import { download, getDate } from './utils/Utils'
import Question from './componets/Question'
import FileLoader from './componets/FileLoader'
import Icon from './componets/Icon'

function App() {
  const [html, setHTML] = useState('')
  const questions = useObservable([])

  async function onParse() {
    const parser = new DOMParser()
    const website = parser.parseFromString(html, 'text/html')
    const link = Array.from(website.getElementsByTagName('link')).find(m => m.rel === 'canonical')

    let url = ''
    if (link && link.href) {
      const parts = link.href.split('/')
      url = parts[0] + '//' + parts[2] + '/'
    }
    
    const quiz = website.getElementsByClassName('quiz-report')[0]

    let question
    if(quiz) {

      for (const img of Array.from(quiz.getElementsByTagName('img')).filter(i => i.className !== 'pure-img feedback-icon')) {
        try {
          img.src = await fetch('/parser/img/', {
            method: 'POST',
            body: url + img.src.replace(img.baseURI,'')
          }).then(r => r.text()).then(r => r) 
        } catch (error) {
          img.src = url + img.src.replace(img.baseURI,'')
        }
      }

      for (const line of quiz.children) {
        if(line.localName === 'dt') {
          if(question) addQuestion(question)
          let value = ''
          for (let index = 2; index < line.children.length; index++) {
            const element = line.children[index]
            value+='<p>'+element.innerHTML+'<p />'
          }
          question = {
            question: value,
            answers: [],
          }
        }
        if(line.localName === 'dd' && line.innerText !== '\n          ') {
          for (const row of line.children[1].rows) {
            const correctNode = row.children[0].firstChild
            question.answers.push({
              correct: !correctNode ? false : (
                correctNode.alt === 'Should have chosen' ||
                correctNode.alt === 'Correct'
              ),
              value: row.children[1].innerText,
            })
          }
        }
      }
      if(question) addQuestion(question)
    }
    setHTML('')
  }

  function addQuestion(question){
    question.answers.sort((a,b) => a.value > b.value ? 1 : -1)
    question.answers.sort((a,b) => a.value > b.value ? 1 : -1)
    const finded = questions.find(q => {
      if(q.question === question.question 
        && q.answers.length === question.answers.length
      ) {
        for (let i = 0; i < question.answers.length; i++) {
          if(question.answers[i].value !== q.answers[i].value) return false
        }   
        return true
      }
      return false
    })
    if(!finded) questions.push(question)
  }

  function onDownload() {
    download(`questions-${getDate()}.json`, JSON.stringify(questions))
  }

  function onLoad(content) {
    const imported = JSON.parse(content)
    if (!Array.isArray(imported) || imported.some(question => (
      !question || typeof question.question !== 'string' || !Array.isArray(question.answers) ||
      question.answers.some(answer => !answer || typeof answer.value !== 'string' || typeof answer.correct !== 'boolean')
    ))) {
      throw new Error('Invalid question file')
    }
    questions.clear()
    questions.push(...imported)
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Quiz parser</h1>
        <p>Paste a quiz report or load a question file, review the answers, then download your quiz.</p>
      </header>
      <section className="source-panel" aria-labelledby="source-heading">
        <h2 id="source-heading">Import questions</h2>
        <label htmlFor="quiz-html">Quiz report HTML</label>
        <textarea
          id="quiz-html"
          rows={8}
          placeholder='Paste HTML here'
          onChange={(e) => setHTML(e.target.value)}
          value={html}
        />
        <div className="actions">
          <button type="button" className="button button-primary" onClick={onParse}>
            <Icon name="parse" />Parse
          </button>
          <button type="button" className="button" onClick={onDownload}>
            <Icon name="download" />Download
          </button>
          <FileLoader text='Load' onLoad={onLoad} />
        </div>
      </section>
      <section className="questions" aria-labelledby="questions-heading">
        <h2 id="questions-heading" aria-live="polite" aria-atomic="true">Questions: {questions.length}</h2>
        {questions.length === 0 && <p className="empty-state">Your imported questions will appear here. Correct answers are marked with a checked box and a label.</p>}
        {questions.map((q, index) => <Question key={q.question} value={q} number={index + 1} />)}
      </section>
    </main>
  )
}

export default observer(App)
