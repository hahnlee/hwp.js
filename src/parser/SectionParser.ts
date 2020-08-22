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
import ByteReader from '../utils/byteReader'

class SectionParser {
  private reader: ByteReader

  private result = new Section()

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

  parse(): Section {
    while (!this.reader.isEOF()) {
      const [tagID,, size] = this.reader.readRecord()

      switch (tagID) {
        case SectionTagID.HWPTAG_PAGE_DEF: {
          this.visitPageDef()
          break
        }

        default: {
          this.reader.skipByte(size)
        }
      }
    }

    return this.result
  }
}

export default SectionParser
