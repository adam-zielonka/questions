import React, { useState } from 'react'
import { observer, useObservable } from 'mobx-react-lite'
import { TextArea, Button } from '@blueprintjs/core'
import { download, getDate } from './utils/Utils'
import Question from './componets/Question'
import FileLoader from './componets/FileLoader'

function App() {
  const [html, setHTML] = useState()
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
    questions.clear()
    questions.push(...JSON.parse(content))
  }

  return (
    <div className="App">
      <TextArea
        large={true}
        placeholder='Paste HTML here'
        onChange={(e) => setHTML(e.target.value)}
        value={html}
      />
      <br />
      <Button
        icon='translate'
        text='Parse'
        onClick={onParse} 
      />
      <Button
        icon='download'
        text='Download'
        onClick={onDownload} 
      />
      <FileLoader
        text='Load'
        onLoad={onLoad} 
      />
      <p>Questions: {questions.length}</p>
      {questions.map(q => <Question key={q.question} value={q} />)}
    </div>
  )
}

export default observer(App)
