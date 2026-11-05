import React from 'react'
import ReactDOM from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import App from './App'

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  act(() => { ReactDOM.render(<App />, container) })
})

afterEach(() => {
  act(() => { ReactDOM.unmountComponentAtNode(container) })
  container.remove()
  vi.restoreAllMocks()
})

const quiz = [{
  question: '<p>Which answer is correct?</p>',
  answers: [
    { value: 'A correct answer', correct: true, checked: false },
    { value: 'An incorrect answer', correct: false, checked: true },
    { value: 'Another correct answer', correct: true },
  ],
}]

function button(text) {
  return Array.from(container.querySelectorAll('button')).find(node => node.textContent === text)
}

async function load(content) {
  const input = container.querySelector('input[type="file"]')
  act(() => {
    Simulate.change(input, { target: { files: [new File([content], 'quiz.json')], value: '' } })
  })
  await act(async () => {
    await vi.waitFor(() => expect(button('Load').disabled).toBe(false))
  })
}

it('labels the HTML source and exposes named native actions', () => {
  const textarea = container.querySelector('textarea')
  expect(container.querySelector(`label[for="${textarea.id}"]`).textContent).toBe('Quiz report HTML')
  expect(textarea.value).toBe('')
  expect(container.querySelector('#questions-heading').textContent).toBe('Questions: 0')
  for (const name of ['Parse', 'Download', 'Load']) {
    expect(button(name).type).toBe('button')
    expect(button(name).querySelector('svg').getAttribute('aria-hidden')).toBe('true')
  }
})

it('loads JSON and displays correct answers independently of checked progress', async () => {
  await load(JSON.stringify(quiz))
  expect(container.querySelector('#questions-heading').textContent).toBe('Questions: 1')
  const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'))
  expect(checkboxes.map(input => input.checked)).toEqual([true, false, true])
  expect(checkboxes.every(input => input.disabled && input.closest('label'))).toBe(true)
  expect(Array.from(container.querySelectorAll('.answer-status'), node => node.textContent))
    .toEqual(['Correct answer', 'Incorrect answer', 'Correct answer'])
  expect(container.querySelector('.question-content p').textContent).toBe('Which answer is correct?')
})

it('parses report HTML, preserves multiple correct answers and avoids duplicates', async () => {
  const report = `<dl class="quiz-report">
    <dt><span>1</span><span>Question</span><p>Choose the correct answers.</p></dt>
    <dd><span>Answers</span><table><tbody>
      <tr><td><img class="pure-img feedback-icon" alt="Correct"></td><td>Alpha</td></tr>
      <tr><td><img class="pure-img feedback-icon" alt="Should have chosen"></td><td>Beta</td></tr>
      <tr><td></td><td>Gamma</td></tr>
    </tbody></table></dd>
  </dl>`
  for (let i = 0; i < 2; i++) {
    act(() => { Simulate.change(container.querySelector('textarea'), { target: { value: report } }) })
    await act(async () => { Simulate.click(button('Parse')) })
    expect(container.querySelector('textarea').value).toBe('')
  }
  expect(container.querySelector('#questions-heading').textContent).toBe('Questions: 1')
  expect(container.querySelector('.question-content').textContent).toBe('Choose the correct answers.')
  expect(Array.from(container.querySelectorAll('.answer-text'), node => node.textContent)).toEqual(['Alpha', 'Beta', 'Gamma'])
  expect(Array.from(container.querySelectorAll('input[type="checkbox"]'), node => node.checked)).toEqual([true, true, false])
})

it('downloads the loaded quiz as JSON with its correctness flags', async () => {
  await load(JSON.stringify(quiz))
  let downloaded
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
    downloaded = { filename: this.download, href: this.getAttribute('href') }
  })
  act(() => { Simulate.click(button('Download')) })
  expect(downloaded.filename).toMatch(/^questions-\d{4}(-\d{2}){5}\.json$/)
  expect(JSON.parse(decodeURIComponent(downloaded.href.split(',')[1]))).toEqual(quiz)
})

it.each(['not JSON', '{}', '[{"question":"Missing answers"}]'])('reports an invalid file and keeps existing questions: %s', async content => {
  await load(JSON.stringify(quiz))
  await load(content)
  expect(container.querySelector('[role="alert"]').textContent).toContain('valid JSON quiz')
  expect(container.querySelector('#questions-heading').textContent).toBe('Questions: 1')
  expect(button('Load').disabled).toBe(false)
})

it('keeps Load available when file selection is cancelled', () => {
  const input = container.querySelector('input[type="file"]')
  const click = vi.spyOn(input, 'click').mockImplementation(() => {})
  act(() => { Simulate.click(button('Load')) })
  expect(click).toHaveBeenCalledOnce()
  act(() => { Simulate.change(input, { target: { files: [], value: '' } }) })
  expect(button('Load').disabled).toBe(false)
  expect(container.querySelector('[role="alert"]')).toBe(null)
})

it('reports file read errors and permits retrying', async () => {
  vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () { this.onerror() })
  await load('unreadable')
  expect(container.querySelector('[role="alert"]').textContent).toContain('Could not read this file')
  expect(button('Load').disabled).toBe(false)
})
