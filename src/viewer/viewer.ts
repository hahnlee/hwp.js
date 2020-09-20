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

import { CFB$ParsingOptions } from 'cfb/types'

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
import { RGB } from '../types/color'
import parse from '../parser'
import parsePage from '../parser/parsePage'
import Header from './header'

const BORDER_WIDTH = [
  '0.1mm',
  '0.12mm',
  '0.15mm',
  '0.2mm',
  '0.25mm',
  '0.3mm',
  '0.4mm',
  '0.5mm',
  '0.6mm',
  '0.7mm',
  '1.0mm',
  '1.5mm',
  '2.0mm',
  '3.0mm',
  '4.0mm',
  '5.0mm',
]

const BORDER_STYLE: { [key: number]: string } = {
  0: 'none',
  1: 'solid',
  2: 'dashed',
  3: 'dotted',
  8: 'double',
}

const TEXT_ALIGN: { [key: number]: string } = {
  0: 'justify',
  1: 'left',
  2: 'right',
  3: 'center',
}

class HWPViewer {
  private hwpDocument: HWPDocument = new HWPDocument(
    new HWPHeader(new HWPVersion(5, 0, 0, 0), 'HWP Document File'),
    new DocInfo(),
    [],
  )

  private container: HTMLElement

  private viewer: HTMLElement = window.document.createElement('div')

  private pages: HTMLElement[] = []

  private header: Header | null = null

  constructor(container: HTMLElement, data: Uint8Array, option: CFB$ParsingOptions = { type: 'binary' }) {
    this.container = container
    this.hwpDocument = parsePage(parse(data, option))
    this.draw()
  }

  distory() {
    this.pages = []
    this.header?.distory()
    this.viewer.parentElement?.removeChild(this.viewer)
  }

  private createPage(section: Section, index: number) {
    const page = document.createElement('div')

    page.style.boxShadow = '0 1px 3px 1px rgba(60,64,67,.15)'
    page.style.backgroundColor = '#FFF'
    page.style.margin = '0 auto'
    page.style.position = 'relative'
    page.style.pageBreakAfter = 'always'

    page.style.width = `${section.width / 7200}in`
    page.style.height = `${section.height / 7200}in`
    // TODO: (@hahnlee) header 정의하기
    page.style.paddingTop = `${(section.paddingTop + section.headerPadding) / 7200}in`
    page.style.paddingRight = `${section.paddingRight / 7200}in`
    page.style.paddingBottom = `${section.paddingBottom / 7200}in`
    page.style.paddingLeft = `${section.paddingLeft / 7200}in`

    page.setAttribute('data-page-number', index.toString())

    const observer = document.createElement('div')
    observer.style.height = '2px'
    observer.style.position = 'absolute'
    observer.style.width = '100%'
    observer.style.top = '50%'
    observer.style.left = '0'
    observer.classList.add('hwpjs-observer')
    observer.setAttribute('data-page-number', index.toString())
    page.appendChild(observer)

    this.pages.push(page)

    return page
  }

  private getRGBStyle(rgb: RGB) {
    const [red, green, blue] = rgb
    return `rgb(${red}, ${green}, ${blue})`
  }

  private drawViewer() {
    this.viewer.style.backgroundColor = '#E8EAED'
    this.viewer.style.position = 'relative'
    this.viewer.style.overflow = 'hidden'
    this.viewer.style.width = '100%'
    this.viewer.style.height = '100%'
  }

  private drawBorderFill(
    target: HTMLElement,
    borderFillID?: number,
  ) {
    if (borderFillID === undefined) {
      return
    }

    const borderFill = this.hwpDocument.info.borderFills[borderFillID]

    target.style.borderTopColor = this.getRGBStyle(borderFill.style.top.color)
    target.style.borderRightColor = this.getRGBStyle(borderFill.style.right.color)
    target.style.borderBottomColor = this.getRGBStyle(borderFill.style.bottom.color)
    target.style.borderLeftColor = this.getRGBStyle(borderFill.style.left.color)

    target.style.borderTopWidth = BORDER_WIDTH[borderFill.style.top.width]
    target.style.borderRightWidth = BORDER_WIDTH[borderFill.style.right.width]
    target.style.borderBottomWidth = BORDER_WIDTH[borderFill.style.bottom.width]
    target.style.borderLeftWidth = BORDER_WIDTH[borderFill.style.left.width]

    target.style.borderTopStyle = BORDER_STYLE[borderFill.style.top.type]
    target.style.borderRightStyle = BORDER_STYLE[borderFill.style.right.type]
    target.style.borderBottomStyle = BORDER_STYLE[borderFill.style.bottom.type]
    target.style.borderLeftStyle = BORDER_STYLE[borderFill.style.left.type]

    if (borderFill.backgroundColor) {
      target.style.backgroundColor = this.getRGBStyle(borderFill.backgroundColor)
    }
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
      borderFillID,
    } = paragraphList.attribute

    column.style.width = `${width / 100}pt`
    column.style.height = `${height / 100}pt`
    column.colSpan = colSpan
    column.rowSpan = rowSpan

    this.drawBorderFill(column, borderFillID)

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
    table.style.borderCollapse = 'collapse'
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

    if (control.attrubute.vertRealTo === 0) {
      shapeGroup.style.position = 'absolute'
      shapeGroup.style.top = `${control.verticalOffset / 100}pt`
      shapeGroup.style.left = `${control.horizontalOffset / 100}pt`
    } else {
      shapeGroup.style.marginTop = `${control.verticalOffset / 100}pt`
      shapeGroup.style.marginLeft = `${control.horizontalOffset / 100}pt`
    }

    shapeGroup.style.zIndex = `${control.zIndex}`
    shapeGroup.style.verticalAlign = 'middle'
    shapeGroup.style.display = 'inline-block'

    if (isPicture(control)) {
      const image = this.hwpDocument.info.binData[control.info!.binID]
      const blob = new Blob([image.payload], { type: `images/${image.extension}` })
      // TODO: (@hahnlee) revokeObjectURL을 관리할 수 있도록 하기
      const imageURL = window.URL.createObjectURL(blob)
      shapeGroup.style.backgroundImage = `url("${imageURL}")`
      shapeGroup.style.backgroundRepeat = 'no-repeat'
      shapeGroup.style.backgroundPosition = 'center'
      shapeGroup.style.backgroundSize = 'contain'
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
      }

      if (hwpChar.value === 13) {
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
      span.style.lineBreak = 'anywhere'
      span.style.whiteSpace = 'pre-wrap'

      span.style.color = this.getRGBStyle(color)

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

    const shape = this.hwpDocument.info.paragraphShapes[paragraph.shapeIndex]!
    paragraphContainer.style.textAlign = TEXT_ALIGN[shape.align]

    paragraph.shapeBuffer.forEach((shapePointer, index) => {
      const endPos = paragraph.getShapeEndPos(index)
      this.drawText(paragraphContainer, paragraph, shapePointer, endPos)
    })

    container.append(paragraphContainer)
  }

  private drawSection(container: HTMLElement, section: Section, index: number) {
    const page = this.createPage(section, index)
    page.style.marginBottom = '20px'

    section.content.forEach((paragraph) => {
      this.drawParagraph(page, paragraph)
    })

    container.appendChild(page)
  }

  private draw() {
    this.drawViewer()

    const content = document.createElement('div')
    content.style.height = '100%'
    content.style.padding = '52px 24px 24px 24px'
    content.style.overflow = 'auto'
    content.style.position = 'relative'
    content.style.zIndex = '0'

    this.hwpDocument.sections.forEach((section, index) => {
      this.drawSection(content, section, index)
    })

    this.header = new Header(this.viewer, this.container, this.pages)

    this.viewer.appendChild(content)
    this.container.appendChild(this.viewer)
  }
}

export default HWPViewer
