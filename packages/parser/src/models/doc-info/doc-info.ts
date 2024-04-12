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

import { find, type CFB$Container } from 'cfb'
import { inflate } from 'pako'

import type { HWPHeader } from '../header.js'
import { ByteReader } from '../../utils/byte-reader.js'
import { Properties } from './properties.js'
import type { HWPVersion } from '../version.js'
import { IDMappings } from './id-mappings.js'
import { CompatibleDocument } from './compatible-document.js'
import { DocInfoTagID } from '../../constants/tag-id.js'

export class DocInfo {
  constructor(public properties: Properties, public idMappings: IDMappings) {}
  public compatibleDocument?: CompatibleDocument

  static fromCfbContainer(
    container: CFB$Container,
    header: HWPHeader,
  ): DocInfo {
    const docInfoEntry = find(container, 'DocInfo')

    if (!docInfoEntry) {
      throw new Error('DocInfo not exist')
    }

    if (!ArrayBuffer.isView(docInfoEntry.content)) {
      throw new Error('DocInfo content is not ArrayBuffer')
    }

    if (header.flags.compressed) {
      const decodedContent: Uint8Array = inflate(docInfoEntry.content, {
        windowBits: -15,
      })
      return DocInfo.fromBytes(decodedContent, header.version)
    }
    return DocInfo.fromBytes(docInfoEntry.content, header.version)
  }

  static fromBytes(bytes: Uint8Array, version: HWPVersion): DocInfo {
    const reader = new ByteReader(bytes.buffer)
    const records = reader.records()

    const properties = Properties.fromRecord(records.next().value!)
    const idMappings = IDMappings.fromRecords(records, version)

    const info = new DocInfo(properties, idMappings)

    while (true) {
      const current = records.next()
      if (current.done) {
        break
      }

      switch (current.value.id) {
        // TODO: Implement other records
        case DocInfoTagID.HWPTAG_COMPATIBLE_DOCUMENT:
          info.compatibleDocument = CompatibleDocument.fromRecords(
            current.value,
            records,
          )
          break
      }
    }

    return info
  }
}
