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

import type { CFB$Entry } from 'cfb'
import { inflate } from 'pako'

import type { HWPHeader } from './header.js'
import { Paragraph } from './paragraph.js'
import { ByteReader } from '../utils/byte-reader.js'
import { PeekableIterator } from '../utils/generator.js'

export class Section {
  constructor(public paragraphs: Paragraph[]) {}

  static fromEntry(entry: CFB$Entry, header: HWPHeader): Section {
    const content = Uint8Array.from(entry.content)

    if (header.flags.compressed) {
      const decoded = inflate(content, { windowBits: -15 })
      return Section.fromBuffer(decoded.buffer, header)
    }

    return Section.fromBuffer(content.buffer, header)
  }

  static fromBuffer(buffer: ArrayBuffer, header: HWPHeader): Section {
    const reader = new ByteReader(buffer)
    const records = new PeekableIterator(reader.records())
    const paragraphs: Paragraph[] = []
    while (!records.isDone()) {
      paragraphs.push(Paragraph.fromRecord(records, header.version))
    }
    return new Section(paragraphs)
  }
}
