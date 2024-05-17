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

import { find, read } from 'cfb'
import { inflate } from 'pako'

import { DocInfo } from './doc-info/doc-info.js'
import { HWPHeader } from './header.js'
import { Section } from './section.js'
import { BinData } from './bin-data.js'
import type { ParseOptions } from '../types/parser.js'

export class HWPDocument {
  constructor(
    public header: HWPHeader,
    public info: DocInfo,
    public sections: Section[],
    public binDataList: BinData[],
  ) {}

  static fromBytes(buffer: Uint8Array, options: ParseOptions) {
    const container = read(buffer, {
      type: 'array',
    })

    const header = HWPHeader.fromCfbContainer(container)
    const docInfo = DocInfo.fromCfbContainer(container, header)

    const sections: Section[] = []

    for (let i = 0; i < docInfo.properties.sections; i += 1) {
      const entry = find(container, `Root Entry/BodyText/Section${i}`)

      if (!entry) {
        throw new Error('Section not exist')
      }
      sections.push(Section.fromEntry(entry, header, options))
    }

    const binDataList: BinData[] = []
    for (const embedded of docInfo.idMappings.embeddings()) {
      const fileName = embedded.getCFBFileName()
      if (!fileName) {
        throw new Error('BinData not exist')
      }
      const entry = find(container, `Root Entry/BinData/${fileName}`)

      if (!entry) {
        throw new Error('BinData not exist')
      }

      const payload = Uint8Array.from(entry.content)

      if (embedded.compressed(header)) {
        const data = inflate(payload, { windowBits: -15 })
        binDataList.push(new BinData(fileName, data))
      } else {
        binDataList.push(new BinData(fileName, payload))
      }
    }

    return new HWPDocument(header, docInfo, sections, binDataList)
  }
}
