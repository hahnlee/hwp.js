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

import { HWPDocument } from './models/document.js'
import { DocInfo } from './models/doc-info/doc-info.js'
import { HWPHeader } from './models/header.js'
import { Section } from './models/section.js'

function parseSection(container: CFB$Container, header: HWPHeader, sectionNumber: number): Section {
  const entry = find(container, `Root Entry/BodyText/Section${sectionNumber}`)

  if (!entry) {
    throw new Error('Section not exist')
  }

  return Section.fromEntry(entry, header)
}

export function parse(input: CFB$Blob): HWPDocument {
  const container: CFB$Container = read(input, {
    type: 'array',
  })

  const header = HWPHeader.fromCfbContainer(container)
  const docInfo = DocInfo.fromCfbContainer(container, header)

  const sections: Section[] = []

  for (let i = 0; i < docInfo.properties.sections; i += 1) {
    sections.push(parseSection(container, header, i))
  }

  return new HWPDocument(header, docInfo, sections)
}
