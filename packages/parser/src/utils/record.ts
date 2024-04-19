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

import type { HWPRecord } from '../models/record.js'
import type { HWPVersion } from '../models/version.js'
import type { PeekableIterator } from './generator.js'

type FromRecord<T> = (record: HWPRecord, version: HWPVersion) => T

export function readItems<T>(
  records: Generator<HWPRecord, void>,
  count: number,
  version: HWPVersion,
  fromRecord: FromRecord<T>,
) {
  const items: T[] = []
  for (let i = 0; i < count; i++) {
    const record = records.next()
    if (record.done) {
      throw new Error('Unexpected EOF')
    }
    items.push(fromRecord(record.value, version))
  }
  return items
}

export function collectChildren(
  iterator: PeekableIterator<HWPRecord>,
  level: number,
) {
  const children: HWPRecord[] = []
  while (!iterator.isDone() && iterator.peek().level > level) {
    children.push(iterator.next())
  }
  return children
}
