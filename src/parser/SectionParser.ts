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

import { SectionTagID } from '../constants/tagID'
import Section from '../models/section'
import Paragraph from '../models/paragraph'
import HWPChar, { CharType } from '../models/char'
import ByteReader from '../utils/byteReader'
import ShapePointer from '../models/shapePointer'

class SectionParser {
  private reader: ByteReader

  private result = new Section()

  private currentParagraph: Paragraph = new Paragraph()

  private content: Paragraph[] = []

  constructor(data: Uint8Array) {
    this.reader = new ByteReader(data)
  }

  visitPageDef() {
    this.result.width = this.reader.readUInt32()
    this.result.height = this.reader.readUInt32()
    this.result.paddingLeft = this.reader.readUInt32()
    this.result.paddingRight = this.reader.readUInt32()
    this.result.paddingTop = this.reader.readUInt32()
    this.result.paddingBottom = this.reader.readUInt32()
    this.result.headerPadding = this.reader.readUInt32()
    this.result.footerPadding = this.reader.readUInt32()

    // TODO: (@hahnlee) 속성정보도 파싱하기
    this.reader.skipByte(4)
  }

  // TODO: (@hahnlee) mapper 패턴 사용하기
  visitParaText(totalByte: number) {
    let readByte = 0

    while (readByte < totalByte) {
      const charCode = this.reader.readUInt16()

      switch (charCode) {
        // Char
        case 0:
        case 10:
        case 13: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Char, charCode),
          )
          readByte += 2
          break
        }

        // Inline
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 19:
        case 20: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Inline, charCode),
          )
          this.reader.skipByte(14)
          readByte += 16
          break
        }

        // Extened
        case 1:
        case 2:
        case 3:
        case 11:
        case 12:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 21:
        case 22:
        case 23: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Extened, charCode),
          )
          this.reader.skipByte(14)
          readByte += 16
          break
        }

        default: {
          this.currentParagraph.content.push(
            new HWPChar(CharType.Char, String.fromCharCode(charCode)),
          )
          readByte += 2
        }
      }
    }
  }

  visitCharShape() {
    const shapePointer = new ShapePointer(
      this.reader.readUInt32(),
      this.reader.readUInt32(),
    )

    this.currentParagraph.shapeBuffer.push(shapePointer)
  }

  parse(): Section {
    while (!this.reader.isEOF()) {
      const [tagID,, size] = this.reader.readRecord()

      switch (tagID) {
        case SectionTagID.HWPTAG_PAGE_DEF: {
          this.visitPageDef()
          break
        }

        case SectionTagID.HWPTAG_PARA_TEXT: {
          this.visitParaText(size)
          break
        }

        case SectionTagID.HWPTAG_PARA_CHAR_SHAPE: {
          this.visitCharShape()
          break
        }

        default: {
          this.reader.skipByte(size)
        }
      }
    }

    this.content.push(this.currentParagraph)
    this.content.shift()

    this.result.content = this.content

    return this.result
  }
}

export default SectionParser
