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
import type { ParseOptions } from '../../types/parser.js'
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'
import { SectionControl } from './section.js'
import { PictureControl } from './shapes/picture.js'
import { GenShapeObjectControl } from './shapes/shape.js'
import { TableControl } from './table.js'
import { UnknownControl } from './unknown.js'

export type ControlContent =
  | TableControl
  | SectionControl
  | GenShapeObjectControl
  | PictureControl
  | UnknownControl

export function parseControl(
  ctrlId: number,
  current: HWPRecord,
  iterator: PeekableIterator<HWPRecord>,
  version: HWPVersion,
  options: ParseOptions,
): ControlContent {
  switch (ctrlId) {
    case OtherCtrlID.Section:
      return SectionControl.fromRecord(current, iterator, version)
    case CommonCtrlID.Table:
      return TableControl.fromRecord(current, iterator, version, options)
    case CommonCtrlID.GenShapeObject:
      return GenShapeObjectControl.fromRecord(current, iterator, version, options)
    default:
      return UnknownControl.fromRecord(current, iterator)
  }
}
