/**
 * Copyright 2020-Present Han Lee <hanlee.dev@gmail.com>
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

import ByteReader from '../utils/byteReader'
import HWPRecord from '../models/record'

function parseRecordTree(data: Uint8Array): HWPRecord {
  const reader = new ByteReader(data.buffer)

  const root = new HWPRecord(0, 0, 0)

  while (!reader.isEOF()) {
    const [tagID, level, size] = reader.readRecord()

    let parent: HWPRecord = root

    const payload = reader.read(size)

    for (let i = 0; i < level; i += 1) {
      parent = parent.children.slice(-1).pop()!
    }

    parent.children.push(new HWPRecord(tagID, size, parent.tagID, payload))
  }

  return root
}

export default parseRecordTree
