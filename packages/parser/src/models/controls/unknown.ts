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

import type { PeekableIterator } from '../../utils/generator.js'
import { collectChildren } from '../../utils/record.js'
import type { HWPRecord } from '../record.js'
import { Control } from './control.js'

export class UnknownControl extends Control {
  constructor(public id: number, public records: HWPRecord[]) {
    super(id)
  }

  static fromRecord(
    id: number,
    current: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
  ) {
    return new UnknownControl(id, collectChildren(iterator, current.level))
  }
}
