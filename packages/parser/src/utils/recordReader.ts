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

import HWPRecord from '../models/record.js'

class RecordReader {
  private cursor: number

  private records: HWPRecord[]

  constructor(records: HWPRecord[]) {
    this.records = records
    this.cursor = 0
  }

  hasNext() {
    return this.cursor < this.records.length
  }

  current(): HWPRecord {
    return this.records[this.cursor]
  }

  read(): HWPRecord {
    const result = this.records[this.cursor]
    this.cursor += 1
    return result
  }
}

export default RecordReader
