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

import { DocInfoTagID } from '../../constants/tag-id.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { HWPRecord } from '../record.js'

export class LayoutCompatibility {
  constructor(
    /** 글자 단위 서식 */
    public char: number,
    /** 문단 단위 서식 */
    public paragraph: number,
    /** 구역 단위 서식 */
    public section: number,
    /** 개체 단위 서식 */
    public object: number,
    /** 필드 단위 서식 */
    public field: number,
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_LAYOUT_COMPATIBILITY) {
      throw new Error('DocInfo: LayoutCompatibility: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    // NOTE: (@hahnlee) 문서와 되어있지 않음, 정확한 정보는 HWPX와 대조해서 유추해야함
    const char = reader.readUInt32()
    const paragraph = reader.readUInt32()
    const section = reader.readUInt32()
    const object = reader.readUInt32()
    const field = reader.readUInt32()

    if (!reader.isEOF()) {
      throw new Error('DocInfo: LayoutCompatibility: Reader is not EOF')
    }

    return new LayoutCompatibility(char, paragraph, section, object, field)
  }
}
