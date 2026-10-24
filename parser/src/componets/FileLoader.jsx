import React, { useRef, useState } from 'react'
import { Button } from '@blueprintjs/core'

function FileLoader({ onLoad, text }) {
  const ref = useRef()
  const [loading, setLoading] = useState()

  function onClickHandler() {
    if(ref.current) {
      setLoading(true)
      ref.current.click()
    }
  }

  function onChangeHandler(e) {
    const file = e.target.files[0]
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      onLoad(fileReader.result)
      setLoading(false)
    }
    fileReader.readAsText(file)
    e.target.value = ''
  }

  return <>
    <input type='file' ref={ref} onChange={onChangeHandler} hidden />
    <Button text={text} icon='folder-open' onClick={onClickHandler} loading={loading} />
  </>
}

export default FileLoader
