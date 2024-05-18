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
  type HWPChar,
  CharControl,
  CharControls,
  ExtendedControl,
  readChar,
} from './char.js'
import type { HWPRecord } from './record.js'
import { SectionTagID } from '../constants/tag-id.js'
import { ByteReader } from '../utils/byte-reader.js'

export function parseChars(record: HWPRecord, count: number) {
  if (record.id !== SectionTagID.HWPTAG_PARA_TEXT) {
    throw new Error('BodyText: CharList: Record has wrong ID')
  }

  const reader = new ByteReader(record.data)

  const chars: HWPChar[] = []
  let i = 0
  while (i < count) {
    const char = readChar(reader)
    i += char.bytes
    chars.push(char)
  }

  if (!reader.isEOF()) {
    throw new Error('BodyText: CharList: Reader is not EOF')
  }

  return chars
}

export function createEmptyCharList() {
  return [new CharControl(CharControls.ParaBreak)]
}

export function extendedControls(chars: HWPChar[]) {
  return chars.filter((char) => char instanceof ExtendedControl)
}
