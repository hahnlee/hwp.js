function handleRequest(details) {
  const view = 'content/viewer.html'
  const redirectUrl = `${chrome.extension.getURL(view)}?file=${encodeURIComponent(details.url)}`
  return {
    redirectUrl,
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  handleRequest,
  {
    urls: [
      'http://*/*.hwp',
      'https://*/*.hwp',
      'file:///*/*.hwp',
    ],
    types: ['main_frame'],
  },
  ['blocking'],
)
