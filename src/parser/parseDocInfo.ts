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

import { find, CFB$Container } from 'cfb'
import { inflate } from 'pako'

import { DocInfoTagID } from '../constants/tagID'
import DocInfo from '../models/docInfo'
import ByteReader from '../utils/byteReader'

class DocInfoParser {
  private reader: ByteReader

  private result = new DocInfo()

  constructor(data: Uint8Array) {
    this.reader = new ByteReader(data)
  }

  visitDocumentPropertes(size: number) {
    this.result.sectionSize = this.reader.readUInt16()

    // TODO: (@hahnlee) 다른 프로퍼티도 구현하기
    this.reader.skipByte(size - 2)
  }

  parse() {
    while (!this.reader.isEOF()) {
      const [tagID, , size] = this.reader.readRecord()

      switch (tagID) {
        case DocInfoTagID.HWPTAG_DOCUMENT_PROPERTIES: {
          this.visitDocumentPropertes(size)
          break
        }
        default:
          this.reader.skipByte(size)
      }
    }

    return this.result
  }
}

function parseDocInfo(container: CFB$Container): DocInfo {
  const docInfoEntry = find(container, 'DocInfo')

  if (!docInfoEntry) {
    throw new Error('DocInfo not exist')
  }

  const content: Uint8Array = docInfoEntry.content as Uint8Array
  const decodedContent: Uint8Array = inflate(content, { windowBits: -15 })

  return new DocInfoParser(decodedContent).parse()
}

export default parseDocInfo
