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

import { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import { SectionTagID } from '../../constants/tag-id.js'
import { type ControlContent, parseControl } from './content.js'
import { HWPVersion } from '../version.js'
import type { ParseOptions } from '../../types/parser.js'

export class Control {
  constructor(public id: number, public content: ControlContent) {}

  static fromRecords(
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
    options: ParseOptions,
  ) {
    const current = iterator.next()
    if (current.id !== SectionTagID.HWPTAG_CTRL_HEADER) {
      throw new Error('Control: Record has wrong ID')
    }

    const reader = new ByteReader(current.data)
    const id = reader.readUInt32()

    const content = parseControl(id, current, iterator, version, options)

    return new Control(id, content)
  }
}
