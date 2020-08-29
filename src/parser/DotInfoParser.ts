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
import { CFB$Container, find } from 'cfb'
import { inflate } from 'pako'

import { DocInfoTagID } from '../constants/tagID'
import BinData from '../models/binData'
import ByteReader from '../utils/byteReader'
import CharShape from '../models/charShape'
import DocInfo from '../models/docInfo'
import FontFace from '../models/fontFace'
import { getRGB, getFlag } from '../utils/bitUtils'

class DocInfoParser {
  private reader: ByteReader

  private result = new DocInfo()

  private container: CFB$Container

  constructor(data: Uint8Array, container: CFB$Container) {
    this.reader = new ByteReader(data.buffer)
    this.container = container
  }

  visitDocumentPropertes(size: number) {
    this.result.sectionSize = this.reader.readUInt16()

    // TODO: (@hahnlee) 다른 프로퍼티도 구현하기
    this.reader.skipByte(size - 2)
  }

  visitCharShape(size: number) {
    const charShape = new CharShape(
      [
        this.reader.readUInt16(),
        this.reader.readUInt16(),
        this.reader.readUInt16(),
        this.reader.readUInt16(),
        this.reader.readUInt16(),
        this.reader.readUInt16(),
        this.reader.readUInt16(),
      ],
      [
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
      ],
      [
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
      ],
      [
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
        this.reader.readUInt8(),
      ],
      [
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
        this.reader.readInt8(),
      ],
      this.reader.readInt32(),
      this.reader.readUInt32(),
      this.reader.readUInt8(),
      this.reader.readUInt8(),
      this.reader.readUInt32(),
      this.reader.readUInt32(),
      this.reader.readUInt32(),
      this.reader.readUInt32(),
    )

    if (size > 68) {
      charShape.fontBackgroundId = this.reader.readUInt16()
    }

    if (size > 70) {
      charShape.underLineColor = getRGB(this.reader.readInt32())
    }

    this.result.charShapes.push(charShape)
  }

  visitFaceName() {
    const attribute = this.reader.readUInt8()
    const hasAlternative = getFlag(attribute, 7)
    const hasAttribute = getFlag(attribute, 6)
    const hasDefault = getFlag(attribute, 5)

    const fontFace = new FontFace()
    fontFace.name = this.reader.readString()

    if (hasAlternative) {
      this.reader.skipByte(1)
      fontFace.alternative = this.reader.readString()
    }

    if (hasAttribute) {
      this.reader.skipByte(10)
    }

    if (hasDefault) {
      fontFace.default = this.reader.readString()
    }

    this.result.fontFaces.push(fontFace)
  }

  visitBinData() {
    this.reader.readUInt16()
    const id = this.reader.readUInt16()
    const extension = this.reader.readString()
    const path = `Root Entry/BinData/BIN${`${id}`.padStart(4, '0')}.${extension}`
    const payload = find(this.container, path)!.content as Uint8Array
    this.result.binData.push(new BinData(extension, inflate(payload, { windowBits: -15 })))
  }

  parse() {
    while (!this.reader.isEOF()) {
      const [tagID, , size] = this.reader.readRecord()

      switch (tagID) {
        case DocInfoTagID.HWPTAG_DOCUMENT_PROPERTIES: {
          this.visitDocumentPropertes(size)
          break
        }

        case DocInfoTagID.HWPTAG_CHAR_SHAPE: {
          this.visitCharShape(size)
          break
        }

        case DocInfoTagID.HWPTAG_FACE_NAME: {
          this.visitFaceName()
          break
        }

        case DocInfoTagID.HWPTAG_BIN_DATA: {
          this.visitBinData()
          break
        }

        default:
          this.reader.skipByte(size)
      }
    }

    return this.result
  }
}

export default DocInfoParser
