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

import { OtherCtrlID } from '../../constants/ctrl-id.js'
import { getBitValue, getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import { Control } from './control.js'

export class ColumnControl extends Control {
  constructor(
    public id: number,
    public kind: ColumnKind,
    public count: number,
    public direction: ColumnDirection,
    public gap: number,
    public widths: number[],
  ) {
    super(id)
  }

  static fromRecord(
    id: number,
    record: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
  ) {
    const reader = new ByteReader(record.data)
    const ctrlId = reader.readUInt32()
    if (ctrlId !== OtherCtrlID.Column) {
      throw new Error(`Expected ColumnControl, but got ${ctrlId}`)
    }

    const properties = reader.readUInt16()
    const kind = mapColumnKind(getBitValue(properties, 0, 1))
    const count = getBitValue(properties, 2, 9)
    const direction = mapColumnDirection(getBitValue(properties, 10, 11))
    const sameWidth = getFlag(properties, 12)

    const gap = reader.readUInt16()

    const widths: number[] = []
    if (!sameWidth) {
      for (let i = 0; i < count; i++) {
        widths.push(reader.readUInt16())
      }
    }

    // NOTE: (@hahnlee) 속성의 bit 16-32, 어떤 내용이 담기는지는 표준문서에 정의되어 있지 않다
    reader.readUInt16()

    return new ColumnControl(id, kind, count, direction, gap, widths)
  }
}

export enum ColumnKind {
  Normal,
  Distributed,
  Parallel,
}

function mapColumnKind(kind: number): ColumnKind {
  switch (kind) {
    case ColumnKind.Normal:
      return ColumnKind.Normal
    case ColumnKind.Distributed:
      return ColumnKind.Distributed
    case ColumnKind.Parallel:
      return ColumnKind.Parallel
    default:
      throw new Error(`Unknown ColumnKind: ${kind}`)
  }
}

export enum ColumnDirection {
  Left,
  Right,
  Both,
}

function mapColumnDirection(direction: number): ColumnDirection {
  switch (direction) {
    case ColumnDirection.Left:
      return ColumnDirection.Left
    case ColumnDirection.Right:
      return ColumnDirection.Right
    case ColumnDirection.Both:
      return ColumnDirection.Both
    default:
      throw new Error(`Unknown ColumnDirection: ${direction}`)
  }
}
