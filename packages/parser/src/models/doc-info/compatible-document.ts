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
import type { HWPRecord } from '../record.js'
import { DocInfoTagID } from '../../constants/tag-id.js'
import { LayoutCompatibility } from './layout-compatibility.js'

export class CompatibleDocument {
  constructor(
    /** 대상 프로그램 */
    public targetProgram: TargetProgram,
    /** 레이아웃 호환성 */
    public layoutCompatibility: LayoutCompatibility,
  ) {}

  static fromRecords(
    record: HWPRecord,
    records: Generator<HWPRecord, void, unknown>,
  ) {
    if (record.id !== DocInfoTagID.HWPTAG_COMPATIBLE_DOCUMENT) {
      throw new Error('DocInfo: CompatibleDocument: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const targetProgram = mapTargetProgram(reader.readUInt32())
    if (!reader.isEOF()) {
      throw new Error('DocInfo: CompatibleDocument: Reader is not EOF')
    }

    const next = records.next()
    if (next.done) {
      throw new Error('Unexpected EOF')
    }

    const layoutCompatibility = LayoutCompatibility.fromRecord(next.value)
    return new CompatibleDocument(targetProgram, layoutCompatibility)
  }
}

export enum TargetProgram {
  /** 한/글 문서(현재 버전) */
  HWP201X,
  /** 한/글 2007 호환 문서 */
  HWP200X,
  /** MS 워드 호환 문서 */
  MSWord,
}

function mapTargetProgram(value: number) {
  if (value >= TargetProgram.HWP201X && value <= TargetProgram.MSWord) {
    return value as TargetProgram
  }
  throw new Error(`Unknown TargetProgram: ${value}`)
}
