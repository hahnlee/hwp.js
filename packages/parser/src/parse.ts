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

import {
  read,
  find,
  type CFB$Blob,
  type CFB$Container,
} from 'cfb'
import { inflate } from 'pako'

import { HWPDocument } from './models/document.js'
import { DocInfo } from './models/doc-info/doc-info.js'
import { HWPHeader } from './models/header.js'
import { Section } from './models/section.js'
import { DocInfoParser } from './doc-info-parser.js'
import { SectionParser } from './section-parser.js'

function parseDocInfo(container: CFB$Container, header: HWPHeader): DocInfo {
  const docInfoEntry = find(container, 'DocInfo')

  if (!docInfoEntry) {
    throw new Error('DocInfo not exist')
  }

  const content = docInfoEntry.content

  if (header.flags.compressed) {
    const decodedContent = inflate(Uint8Array.from(content), { windowBits: -15 })
    return new DocInfoParser(header, decodedContent, container).parse()
  } else {
    return new DocInfoParser(header, Uint8Array.from(content), container).parse()
  }
}

function parseSection(container: CFB$Container, header: HWPHeader, sectionNumber: number): Section {
  const section = find(container, `Root Entry/BodyText/Section${sectionNumber}`)

  if (!section) {
    throw new Error('Section not exist')
  }

  const content = section.content

  if (header.flags.compressed) {
    const decodedContent = inflate(Uint8Array.from(content), { windowBits: -15 })
    return new SectionParser(decodedContent).parse()
  } else {
    return new SectionParser(Uint8Array.from(content)).parse()
  }
}

export function parse(input: CFB$Blob): HWPDocument {
  const container: CFB$Container = read(input, {
    type: 'array',
  })

  const header = HWPHeader.fromCfbContainer(container)
  const docInfo = parseDocInfo(container, header)

  const sections: Section[] = []

  for (let i = 0; i < docInfo.sectionSize; i += 1) {
    sections.push(parseSection(container, header, i))
  }

  return new HWPDocument(header, docInfo, sections)
}
