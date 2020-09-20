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
          if (entry.isIntersecting && entry.target.parentElement) {
            const page = entry.target.getAttribute('data-page-number')
            const pageNumber = Number(page) + 1
            this.updatePageNumber(pageNumber)
          }
        }
      })
    }, {
      root: this.content,
      rootMargin: '0px',
    })

    this.pages.forEach((page) => {
      this.observer.observe(<Element>page.querySelector('.hwpjs-observer'))
    })

    this.draw()
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
    header.style.boxShadow = '0 1px 0 rgba(204, 204, 204, 1)'
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

    const title = document.createElement('h1')
    const link = document.createElement('a')
    link.href = 'https://github.com/hahnlee/hwp.js'
    link.textContent = 'hwp.js'
    link.target = '_blink'
    link.rel = 'noopener noreferrer'
    title.appendChild(link)

    const description = document.createElement('p')
    description.textContent = '본 제품은 한글과컴퓨터의 한/글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다.'
    content.appendChild(description)

    content.appendChild(title)
    content.appendChild(description)
    modal.appendChild(content)
    view.appendChild(modal)

    modal.addEventListener('click', this.handleModalClick)

    return modal
  }

  handleModalClick = () => {
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
    const buttion = document.createElement('button')
    buttion.style.marginLeft = '10px'
    buttion.style.cursor = 'pointer'
    buttion.textContent = 'ℹ️'
    buttion.addEventListener('click', this.handleInfoButtionClick)
    this.container.appendChild(buttion)

    this.infoButton = buttion
  }

  drawPrintIcon() {
    const buttion = document.createElement('button')
    buttion.style.marginLeft = '10px'
    buttion.style.cursor = 'pointer'
    buttion.textContent = '🖨️'
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
