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

import { CommonCtrlID, OtherCtrlID } from '../../constants/ctrl-id.js'
import { SectionTagID } from '../../constants/tag-id.js'
import type { ParseOptions } from '../../types/parser.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'
import { ColumnControl } from './column.js'
import { SectionControl } from './section.js'
import { GenShapeObjectControl } from './shapes/shape.js'
import { TableControl } from './table.js'
import { UnknownControl } from './unknown.js'

function mapControl(
  ctrlId: number,
  current: HWPRecord,
  iterator: PeekableIterator<HWPRecord>,
  version: HWPVersion,
  options: ParseOptions,
) {
  switch (ctrlId) {
    case OtherCtrlID.Column:
      return ColumnControl.fromRecord(ctrlId, current, iterator)
    case OtherCtrlID.Section:
      return SectionControl.fromRecord(ctrlId, current, iterator, version)
    case CommonCtrlID.Table:
      return TableControl.fromRecord(
        ctrlId,
        current,
        iterator,
        version,
        options,
      )
    case CommonCtrlID.GenShapeObject:
      return GenShapeObjectControl.fromRecord(
        ctrlId,
        current,
        iterator,
        version,
        options,
      )
    default:
      return UnknownControl.fromRecord(ctrlId, current, iterator)
  }
}

export function parseControl(
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

  return mapControl(id, current, iterator, version, options)
}
