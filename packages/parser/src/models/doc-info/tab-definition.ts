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

export class TabDefinition {
  constructor(
    public leftTab: boolean,
    public rightTab: boolean,
    public tabInfos: TabInfo[],
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_TAB_DEF) {
      throw new Error('DocInfo: TabDefinition: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const attribute = reader.readUInt32()
    const leftTab = getFlag(attribute, 0)
    const rightTab = getFlag(attribute, 1)

    const count = reader.readUInt32()
    const tabInfos: TabInfo[] = []
    for (let i = 0; i < count; i++) {
      tabInfos.push(TabInfo.fromReader(reader))
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: TabDefinition: Reader is not EOF')
    }

    return new TabDefinition(leftTab, rightTab, tabInfos)
  }
}

export class TabInfo {
  constructor(
    public position: number,
    public kind: TabKind,
    public borderKind: number,
  ) {}

  static fromReader(reader: ByteReader) {
    const position = reader.readUInt32()
    const kind = reader.readUInt8()
    const borderKind = reader.readUInt8()
    // 8 바이트를 맞추기 위한 예약
    reader.readUInt16()

    return new TabInfo(position, kind, borderKind)
  }
}

export enum TabKind {
  Left,
  Right,
  Center,
  Decimal,
}
