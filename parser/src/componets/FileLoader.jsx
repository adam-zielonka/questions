import React, { useRef, useState } from 'react'
import Icon from './Icon'

function FileLoader({ onLoad, text }) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function onClickHandler() {
    if(ref.current) {
      ref.current.click()
    }
  }

  function onChangeHandler(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    setError('')
    const fileReader = new FileReader()
    fileReader.onload = () => {
      try {
        onLoad(fileReader.result)
      } catch (error) {
        setError('Could not load this question file. Please choose a valid JSON quiz.')
      } finally {
        setLoading(false)
      }
    }
    fileReader.onerror = () => {
      setError('Could not read this file. Please try again.')
      setLoading(false)
    }
    fileReader.onabort = () => setLoading(false)
    fileReader.readAsText(file)
  }

  return <>
    <input type='file' aria-label='Load question file' accept='.json,application/json,text/plain' ref={ref} onChange={onChangeHandler} hidden />
    <button type="button" className="button" onClick={onClickHandler} disabled={loading} aria-busy={loading}>
      <Icon name="folder" />{loading ? 'Loading…' : text}
    </button>
    {error && <p className="file-error" role="alert">{error}</p>}
  </>
}

export default FileLoader
