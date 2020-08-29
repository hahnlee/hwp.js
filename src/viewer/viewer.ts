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

import { Control } from '../models/controls'
import TableControl, { TableColumnOption } from '../models/controls/table'
import { ShapeControls } from '../models/controls/shapes'
import DocInfo from '../models/docInfo'
import { CharType } from '../models/char'
import HWPDocument from '../models/document'
import HWPHeader from '../models/header'
import HWPVersion from '../models/version'
import Section from '../models/section'
import ShapePointer from '../models/shapePointer'
import Paragraph from '../models/paragraph'
import ParagraphList from '../models/paragraphList'
import { isTable, isShape, isPicture } from '../utils/controlUtil'
import parse from '../parser'

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

  private drawColumn(
    container: HTMLTableRowElement,
    paragraphList: ParagraphList<TableColumnOption>,
  ) {
    const column = document.createElement('td')
    const {
      width,
      height,
      colSpan,
      rowSpan,
    } = paragraphList.attribute

    column.style.width = `${width / 100}pt`
    column.style.height = `${height / 100}pt`
    column.colSpan = colSpan
    column.rowSpan = rowSpan

    paragraphList.items.forEach((paragraph) => {
      this.drawParagraph(column, paragraph)
    })

    container.appendChild(column)
  }

  private drawTable(
    container: HTMLElement,
    control: TableControl,
  ) {
    const table = document.createElement('table')
    table.style.display = 'inline-table'
    table.style.width = `${control.width / 100}pt`
    table.style.height = `${control.height / 100}pt`

    const tbody = document.createElement('tbody')

    for (let i = 0; i < control.rowCount; i += 1) {
      const tr = document.createElement('tr')

      control.content[i].forEach((paragraphList) => {
        this.drawColumn(tr, paragraphList)
      })

      tbody.appendChild(tr)
    }

    table.appendChild(tbody)
    container.appendChild(table)
  }

  private drawShape(
    container: HTMLElement,
    control: ShapeControls,
  ) {
    const shapeGroup = document.createElement('div')
    shapeGroup.style.width = `${control.width / 100}pt`
    shapeGroup.style.height = `${control.height / 100}pt`
    shapeGroup.style.position = 'absolute'
    shapeGroup.style.top = `${control.verticalOffset / 100}pt`
    shapeGroup.style.zIndex = `${control.zIndex}`

    if (isPicture(control)) {
      const image = this.hwpDocument.info.binData[control.info!.binID]
      const blob = new Blob([image.payload], { type: `images/${image.extension}` })
      // TODO: (@hahnlee) revokeObjectURL을 관리할 수 있도록 하기
      const imageURL = window.URL.createObjectURL(blob)
      shapeGroup.style.backgroundImage = `url("${imageURL}")`
    }

    control.content.forEach((paragraphList) => {
      paragraphList.items.forEach((paragraph) => {
        this.drawParagraph(shapeGroup, paragraph)
      })
    })

    container.appendChild(shapeGroup)
  }

  private drawControl(
    container: HTMLElement,
    control: Control,
  ) {
    if (isTable(control)) {
      this.drawTable(container, control)
      return
    }

    if (isShape(control)) {
      this.drawShape(container, control)
    }
  }

  private drawText(
    container: HTMLElement,
    paragraph: Paragraph,
    shapePointer: ShapePointer,
    endPos: number,
  ) {
    const range = paragraph.content.slice(shapePointer.pos, endPos + 1)

    const texts: string[] = []
    let ctrlIndex = 0

    range.forEach((hwpChar) => {
      if (typeof hwpChar.value === 'string') {
        texts.push(hwpChar.value)
        return
      }

      if (hwpChar.type === CharType.Extened) {
        const control = paragraph.controls[ctrlIndex]
        ctrlIndex += 1
        this.drawControl(container, control)
        return
      }

      if (hwpChar.value === 10) {
        texts.push('\n')
      }
    })

    const text = texts.join('')

    const span = document.createElement('div')
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

  private drawParagraph(
    container: HTMLElement,
    paragraph: Paragraph,
  ) {
    const paragraphContainer = document.createElement('div')
    paragraphContainer.style.margin = '0'
    paragraphContainer.style.position = 'relative'

    paragraph.shapeBuffer.forEach((shapePointer, index) => {
      const endPos = paragraph.getShapeEndPos(index)
      this.drawText(paragraphContainer, paragraph, shapePointer, endPos)
    })

    container.append(paragraphContainer)
  }

  private drawSection = (section: Section) => {
    const page = createPage(section)

    section.content.forEach((paragraph) => {
      this.drawParagraph(page, paragraph)
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
