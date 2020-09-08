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

import Section from '../models/section'
import Paragraph from '../models/paragraph'
import LineSegment from '../models/lineSegment'
import { CharType } from '../models/char'
import { isTable } from '../utils/controlUtil'
import TableControl, { TableColumnOption } from '../models/controls/table'
import ParagraphList from '../models/paragraphList'
import { CommonCtrlID } from '../constants/ctrlID'

class PageBuilder {
  private section: Section

  private currentSection: Section = new Section()

  private currentParagraph: Paragraph = new Paragraph()

  private readIndex: number = 0

  private contentHeight: number = 0

  private currentHeight: number = 0

  private controlIndex: number = 0

  private startChatIndex: number = 0

  private endCharIndex: number = 0

  private shapeBufferIndex: number = 0

  private latestY: number = 0

  constructor(section: Section) {
    this.section = section
    this.contentHeight = (
      section.height
      - section.headerPadding
      - section.footerPadding
      - section.paddingTop
      - section.paddingBottom
    )
  }

  result: Section[] = []

  getLine(lineSegment: LineSegment, index: number, paragraph: Paragraph) {
    const { start } = lineSegment
    const nextSize = paragraph.getNextSize(index)

    const line = []

    let read = start
    while (read < nextSize) {
      const char = paragraph.content[this.readIndex]
      if (char.type === CharType.Char) {
        read += 1
      } else {
        read += 8
      }
      line.push(char)
      this.readIndex += 1
    }

    return line
  }

  checkoutShpeBuffer(paragraph: Paragraph) {
    let endIndex = paragraph.getShapeEndPos(this.shapeBufferIndex)
    let startIndex = 0

    while (
      this.endCharIndex <= endIndex
      && this.shapeBufferIndex < paragraph.shapeBuffer.length - 1
    ) {
      endIndex = paragraph.getShapeEndPos(this.shapeBufferIndex)

      const shapeBuffer = paragraph.shapeBuffer[this.shapeBufferIndex]

      this.currentParagraph.shapeBuffer.push({
        shapeIndex: shapeBuffer.shapeIndex,
        pos: startIndex,
      })

      startIndex += (endIndex - this.startChatIndex - startIndex)
      this.shapeBufferIndex += 1
    }

    const shapeBuffer = paragraph.shapeBuffer[this.shapeBufferIndex]

    this.currentParagraph.shapeBuffer.push({
      shapeIndex: shapeBuffer.shapeIndex,
      pos: startIndex,
    })
  }

  exitParagraph(paragraph: Paragraph) {
    this.checkoutShpeBuffer(paragraph)
    this.currentSection.content.push(this.currentParagraph)
  }

  exitPage(paragraph: Paragraph) {
    this.exitParagraph(paragraph)

    this.result.push(this.currentSection)

    // Reset
    this.currentSection = new Section()

    this.currentSection.width = this.section.width
    this.currentSection.height = this.section.height
    this.currentSection.paddingTop = this.section.paddingTop
    this.currentSection.paddingRight = this.section.paddingRight
    this.currentSection.paddingBottom = this.section.paddingBottom
    this.currentSection.paddingLeft = this.section.paddingLeft
    this.currentSection.headerPadding = this.section.headerPadding
    this.currentSection.footerPadding = this.section.footerPadding

    this.currentParagraph = new Paragraph()
    this.currentParagraph.shapeIndex = paragraph.shapeIndex
    this.currentHeight = 0
  }

  getTable(list: ParagraphList<TableColumnOption>[][], width: number): TableControl {
    const height = list.reduce((result, current) => {
      const columnHeight = Math.min(...current.map((c) => c.attribute.height))
      return result + columnHeight
    }, 0)

    const control = new TableControl()
    control.id = CommonCtrlID.Table
    control.width = width
    control.height = height
    control.content = list
    control.rowCount = list.length

    return control
  }

  visitLine(lineSegment: LineSegment, index: number, paragraph: Paragraph) {
    const line = this.getLine(lineSegment, index, paragraph)

    if (lineSegment.y === 0 || lineSegment.y < this.latestY) {
      this.exitPage(paragraph)
      this.startChatIndex = this.endCharIndex
    }

    this.latestY = lineSegment.y

    this.currentHeight += (lineSegment.height + lineSegment.lineSpacing)

    line.forEach((content) => {
      if (content.type !== CharType.Extened) {
        this.currentParagraph.content.push(content)
        this.endCharIndex += 1
        return
      }

      const control = paragraph.controls[this.controlIndex]!
      this.controlIndex += 1

      if (!isTable(control)) {
        this.currentParagraph.content.push(content)
        this.currentParagraph.controls.push(control)
        this.endCharIndex += 1
        return
      }

      this.currentHeight -= (lineSegment.height + lineSegment.lineSpacing)

      // split table...
      let result: ParagraphList<TableColumnOption>[][] = []
      control.content.forEach((columns) => {
        const columnHeighrt = Math.min(...columns.map((c) => c.attribute.height))
        this.currentHeight += columnHeighrt

        if (this.currentHeight <= this.contentHeight) {
          result.push(columns)
        } else {
          this.currentHeight = columnHeighrt
          result.push(columns)

          const c = this.getTable(result, control.width)
          this.currentParagraph.content.push(content)
          this.currentParagraph.controls.push(c)
          this.exitPage(paragraph)
          result = []
          this.startChatIndex = this.endCharIndex
        }
      })

      if (result.length > 0) {
        const c = this.getTable(result, control.width)
        this.currentParagraph.content.push(content)
        this.currentParagraph.controls.push(c)
      }

      this.endCharIndex += 1
    })
  }

  visitParagraph = (paragraph: Paragraph) => {
    this.readIndex = 0
    this.controlIndex = 0
    this.startChatIndex = 0
    this.endCharIndex = 0
    this.shapeBufferIndex = 0
    this.currentParagraph = new Paragraph()

    paragraph.lineSegments.forEach((lineSegment, index) => {
      this.visitLine(lineSegment, index, paragraph)
    })

    this.exitParagraph(paragraph)
  }

  build(): Section[] {
    this.section.content.forEach(this.visitParagraph)
    this.result.shift()
    this.result.push(this.currentSection)
    return this.result
  }
}

export default PageBuilder
