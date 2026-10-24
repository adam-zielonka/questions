export function download(filename, text) {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

export function getDate() {
  const date = new Date()
  const addZero = (n) => n > 9 ? n : '0' + n

  return [
    date.getFullYear(),
    addZero(date.getMonth() + 1),
    addZero(date.getDate()),
    addZero(date.getHours()),
    addZero(date.getMinutes()),
    addZero(date.getSeconds()),
  ].join('-')
}
