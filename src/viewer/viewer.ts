/**
 * Copyright 2020-Present Han Lee <hanlee.dev@gmail.com>
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

import DocInfo from '../models/docInfo'
import HWPDocument from '../models/document'
import HWPHeader from '../models/header'
import HWPVersion from '../models/version'
import Section from '../models/section'
import parse from '../parser'
import ShapePointer from '../models/shapePointer'
import Paragraph from '../models/paragraph'

function createPage(section: Section) {
  const page = document.createElement('div')

  page.style.boxShadow = '0 1px 3px 1px rgba(60,64,67,.15)'
  page.style.backgroundColor = '#FFF'
  page.style.margin = '0 auto'

  page.style.width = `${section.width / 7200}in`
  page.style.height = `${section.height / 7200}in`
  page.style.paddingTop = `${section.paddingTop / 7200}in`
  page.style.paddingRight = `${section.paddingRight / 7200}in`
  page.style.paddingBottom = `${section.paddingBottom / 7200}in`
  page.style.paddingLeft = `${section.paddingLeft / 7200}in`

  return page
}

class HWPViewer {
  private hwpDocument: HWPDocument = new HWPDocument(
    new HWPHeader(new HWPVersion(5, 0, 0, 0)),
    new DocInfo(),
    [],
  )

  private container: HTMLElement

  private viewer: HTMLElement = window.document.createElement('div')

  constructor(container: HTMLElement, file: File) {
    this.container = container

    const reader = new FileReader()

    reader.onload = (result) => {
      const bstr = result.target?.result

      if (bstr) {
        this.hwpDocument = parse(bstr as Uint8Array, { type: 'binary' })
        this.draw()
      }
    }

    reader.readAsBinaryString(file)
  }

  private drawViewer() {
    this.viewer.style.backgroundColor = '#E8EAED'
    this.viewer.style.padding = '24px'
  }

  private drawText(
    container: HTMLElement,
    paragraph: Paragraph,
    shapePointer: ShapePointer,
    endPos: number,
  ) {
    const range = paragraph.content.slice(shapePointer.pos, endPos + 1)

    let text = ''

    range.forEach((hwpChar) => {
      if (typeof hwpChar.value === 'string') {
        text += hwpChar.value
      } else if (hwpChar.value === 10) {
        text += '\n'
      }
    })

    const span = document.createElement('span')
    span.textContent = text

    const charShape = this.hwpDocument.info.getCharShpe(shapePointer.shapeIndex)

    if (charShape) {
      const {
        fontBaseSize, fontRatio, color, fontId,
      } = charShape
      const fontSize = fontBaseSize * (fontRatio[0] / 100)
      span.style.fontSize = `${fontSize}pt`
      span.style.whiteSpace = 'pre-wrap'

      const [red, green, blue] = color
      span.style.color = `rgb(${red}, ${green}, ${blue})`

      const fontFace = this.hwpDocument.info.fontFaces[fontId[0]]
      span.style.fontFamily = fontFace.getFontFamily()
    }

    container.appendChild(span)
  }

  private drawSection = (section: Section) => {
    const page = createPage(section)

    section.content.forEach((paragraph) => {
      const paragraphContainer = document.createElement('p')
      paragraphContainer.style.margin = '0'

      paragraph.shapeBuffer.forEach((shapePointer, index) => {
        const endPos = paragraph.getShapeEndPos(index)
        this.drawText(paragraphContainer, paragraph, shapePointer, endPos)
      })

      page.append(paragraphContainer)
    })

    this.viewer.appendChild(page)
  }

  private draw() {
    this.drawViewer()

    this.hwpDocument.sections.forEach(this.drawSection)

    this.container.appendChild(this.viewer)
  }
}

export default HWPViewer
