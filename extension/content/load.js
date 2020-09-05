const fileUrl = decodeURIComponent(window.location.search.slice(6))

const xhr = new XMLHttpRequest()

xhr.onload = () => {
  const fileName = decodeURIComponent(fileUrl.split('/').pop())
  document.title = fileName
  new HWP.viewer(document.body, new Uint8Array(xhr.response), { type: 'array' })
}

xhr.open('GET', fileUrl)
xhr.responseType = 'arraybuffer'
xhr.send()
