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
import { getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { HWPRecord } from '../record.js'
import { Panose } from './panose.js'

export class FontFace {
  constructor(
    /** 글꼴 이름 */
    public name: string,
  ) {}

  /** 기본 글꼴 이름 */
  public defaultFontName?: string
  /** 글꼴유형정보 */
  public panose?: Panose
  /** 대체 글꼴 유형 */
  public alternativeKind?: AlternativeKind
  /** 대체 글꼴 이름 */
  public alternativeFontName?: string

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_FACE_NAME) {
      throw new Error('DocInfo: Font: Record has wrong ID')
    }
    const reader = new ByteReader(record.data)

    const properties = reader.readUInt8()
    const name = reader.readString()

    const hasAlternative = getFlag(properties, 7)
    const hasPanose = getFlag(properties, 6)
    const hasDefaultFont = getFlag(properties, 5)

    const font = new FontFace(name)

    if (hasAlternative) {
      font.alternativeKind = mapAlternativeKind(reader.readUInt8())
      font.alternativeFontName = reader.readString()
    }

    if (hasPanose) {
      font.panose = new Panose(
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
      )
    }

    if (hasDefaultFont) {
      font.defaultFontName = reader.readString()
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: Font: Reader is not EOF')
    }

    return font
  }
}

enum AlternativeKind {
  /** 원래 종류를 알 수 없을 때 */
  Unknown,
  /** 트루타입 글꼴 */
  TTF,
  /** 한/글 전용 글꼴 */
  HFT,
}

function mapAlternativeKind(value: number) {
  if (value >= AlternativeKind.Unknown && value <= AlternativeKind.HFT) {
    return value as AlternativeKind
  }
  throw new Error(`Unknown AlternativeKind: ${value}`)
}
