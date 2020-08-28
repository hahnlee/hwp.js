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

const emptyArrayBuffer = new ArrayBuffer(0)

class HWPRecord {
  children: HWPRecord[] = []

  payload: ArrayBuffer

  tagID: number

  size: number

  parentTagID: number

  constructor(
    tagID: number,
    size: number,
    parentTagID: number,
    payload: ArrayBuffer = emptyArrayBuffer,
  ) {
    this.tagID = tagID
    this.size = size
    this.parentTagID = parentTagID
    this.payload = payload
  }
}

export default HWPRecord
