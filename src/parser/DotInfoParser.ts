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

import { DocInfoTagID } from '../constants/tagID'
import CharShape from '../models/charShape'
import DocInfo from '../models/docInfo'
import ByteReader from '../utils/byteReader'
import { getRGB } from '../utils/bitUtils'

class DocInfoParser {
  private reader: ByteReader

  private result = new DocInfo()

  constructor(data: Uint8Array) {
    this.reader = new ByteReader(data.buffer)
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

        default:
          this.reader.skipByte(size)
      }
    }

    return this.result
  }
}

export default DocInfoParser
