/**
 * Copyright Han Lee <hanlee.dev@gmail.com> and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import printFrame from '../utils/print'

class Header {
  private pages: HTMLElement[]

  private observer: IntersectionObserver

  private container: HTMLElement

  private content: HTMLElement

  private modal: HTMLElement | null = null

  private pageNumber: HTMLElement | null = null

  private infoButton: HTMLElement | null = null

  private printButton: HTMLElement | null = null

  constructor(view: HTMLElement, content: HTMLElement, pages: HTMLElement[]) {
    this.content = content
    this.pages = pages

    this.container = this.drawContainer(view)
    this.modal = this.drawModal(view)

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const page = entry.target.getAttribute('data-page-number')
          const pageNumber = Number(page) + 1
          this.updatePageNumber(pageNumber)
        }
      })
    }, {
      root: this.content,
      rootMargin: '0px',
      threshold: 0.5,
    })

    this.pages.forEach((page) => this.observer.observe(page))

    this.draw()
    if (!document.getElementById('hwpjs-header-css')) {
      const buttonStyle: string = `
      .hwpjs-header-control {
        transition: background .2s;
      }
      .hwpjs-header-control:hover {
        background: #DDD;
      }
      .hwpjs-header-control:active {
        background: #AAA;
      }
      `
      const styleSheet: HTMLStyleElement = document.createElement('style')
      styleSheet.type = 'text/css'
      styleSheet.id = 'hwpjs-header-css'
      styleSheet.innerText = buttonStyle
      document.head.appendChild(styleSheet)
    }
  }

  updatePageNumber(pageNumber: number) {
    if (this.pageNumber) {
      this.pageNumber.textContent = pageNumber.toString()
    }
  }

  distory() {
    this.pages.forEach((page) => {
      this.observer.unobserve(page)
    })

    this.modal?.removeEventListener('click', this.handleModalClick)
    this.modal = null

    this.infoButton?.removeEventListener('click', this.handleInfoButtionClick)
    this.infoButton = null

    this.printButton?.removeEventListener('click', this.handleInfoButtionClick)
    this.printButton = null

    this.pageNumber = null
  }

  drawContainer(container: HTMLElement) {
    const header = document.createElement('div')
    header.style.position = 'absolute'
    header.style.zIndex = '1'
    header.style.top = '0'
    header.style.right = '0'
    header.style.left = '0'
    header.style.boxShadow = '0 1px 3px rgba(204, 204, 204, 1)'
    header.style.backgroundColor = 'rgb(249, 249, 250)'
    header.style.height = '32px'

    const content = document.createElement('div')
    content.style.display = 'flex'
    content.style.alignItems = 'center'
    content.style.height = '100%'
    content.style.margin = '0 auto'
    content.style.maxWidth = '1000px'
    content.style.width = '100%'
    content.style.padding = '0 24px'

    header.appendChild(content)
    container.appendChild(header)

    return content
  }

  drawModal(view: HTMLElement) {
    const modal = document.createElement('div')
    modal.style.position = 'absolute'
    modal.style.zIndex = '2'
    modal.style.top = '0'
    modal.style.right = '0'
    modal.style.bottom = '0'
    modal.style.left = '0'
    modal.style.background = 'rgba(0, 0, 0, 0.7)'
    modal.style.display = 'none'
    modal.style.justifyContent = 'center'
    modal.style.alignItems = 'center'
    modal.style.cursor = 'pointer'

    const content = document.createElement('div')
    content.style.background = '#FFF'
    content.style.borderRadius = '5px'
    content.style.padding = '0 24px'
    content.style.cursor = 'initial'
    content.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'

    const title = document.createElement('h1')
    const link = document.createElement('a')
    link.href = 'https://github.com/hahnlee/hwp.js'
    link.textContent = 'hwp.js'
    link.target = '_blink'
    link.rel = 'noopener noreferrer'
    title.appendChild(link)

    const description = document.createElement('p')
    description.textContent = '본 제품은 한글과컴퓨터의 한/글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다.'

    const copyright = document.createElement('p')
    copyright.textContent = 'Copyright 2020 Han Lee <hanlee.dev@gmail.com> and other contributors.'

    content.appendChild(title)
    content.appendChild(description)
    content.appendChild(copyright)
    modal.appendChild(content)
    view.appendChild(modal)

    modal.addEventListener('click', this.handleModalClick)

    return modal
  }

  handleModalClick = (event: MouseEvent) => {
    if (event.currentTarget !== event.target) return
    if (this.modal) {
      this.modal.style.display = 'none'
    }
  }

  handleInfoButtionClick = () => {
    if (this.modal) {
      this.modal.style.display = 'flex'
    }
  }

  handlePrintButtionClick = () => {
    printFrame(this.pages)
  }

  drawPageNumber() {
    this.pageNumber = document.createElement('span')
    this.pageNumber.textContent = '1'

    const totalPages = document.createElement('span')
    totalPages.textContent = `/${this.pages.length}쪽`

    this.container.appendChild(this.pageNumber)
    this.container.appendChild(totalPages)
  }

  drawInfoIcon() {
    const buttion = document.createElement('div')
    buttion.style.marginLeft = '10px'
    buttion.style.cursor = 'pointer'
    buttion.style.height = '100%'
    buttion.style.padding = '5px'
    buttion.classList.add('hwpjs-header-control')
    buttion.innerHTML = '<svg width="393" height="394" viewBox="0 0 393 394" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden" style="height: 100%;width: auto;"><defs><clipPath id="hwpjs-header-info"><rect x="463" y="144" width="393" height="394"/></clipPath></defs><g clip-path="url(#--hwpjs-header-info)" transform="translate(-463 -144)"><path d="M640.245 292.076 640.245 471.79 678.755 471.79 678.755 292.076ZM640.245 209.21 640.245 247.602 678.755 247.602 678.755 209.21ZM463 144 856 144 856 537 463 537Z" fill-rule="evenodd"/></g></svg>'
    buttion.addEventListener('click', this.handleInfoButtionClick)

    this.container.appendChild(buttion)

    this.infoButton = buttion
  }

  drawPrintIcon() {
    const buttion = document.createElement('div')
    buttion.style.cursor = 'pointer'
    buttion.style.height = '100%'
    buttion.style.padding = '5px'
    buttion.classList.add('hwpjs-header-control')
    buttion.innerHTML = '<svg width="284" height="253" viewBox="0 0 284 253" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden" style="height: 100%;width: auto;"><defs><clipPath id="hwpjs-header-print"><rect x="498" y="82" width="284" height="253"/></clipPath></defs><g clip-path="url(#--hwpjs-header-print)" transform="translate(-498 -82)"><rect x="559" y="93" width="162" height="231" stroke="#000000" stroke-width="20" stroke-miterlimit="8" fill="none"/><path d="M756.613 155.95C751.961 155.95 748.189 159.719 748.189 164.368 748.189 169.018 751.961 172.787 756.613 172.787 761.266 172.787 765.038 169.018 765.038 164.368 765.038 159.719 761.266 155.95 756.613 155.95ZM499 140 781 140 781 228.612 781 275 720.698 275 720.698 228.612 559.302 228.612 559.302 275 499 275 499 228.612Z" fill-rule="evenodd"/><path d="M588 286 647.556 286" stroke="#000000" stroke-width="20" stroke-miterlimit="8" fill="none" fill-rule="evenodd"/><path d="M588 254 670.667 254" stroke="#000000" stroke-width="20" stroke-miterlimit="8" fill="none" fill-rule="evenodd"/></g></svg>'
    buttion.style.marginLeft = 'auto'
    buttion.addEventListener('click', this.handlePrintButtionClick)

    this.container.appendChild(buttion)

    this.printButton = buttion
  }

  draw() {
    this.drawPageNumber()
    this.drawPrintIcon()
    this.drawInfoIcon()
  }
}

export default Header
