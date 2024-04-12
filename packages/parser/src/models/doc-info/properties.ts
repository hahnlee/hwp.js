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

import { ByteReader } from '../../utils/byte-reader.js'
import { HWPRecord } from '../record.js'

export class Properties {
  constructor(
    public sections: number,
    public pageStartNumber: number,
    public footnoteStartNumber: number,
    public endnoteStartNumber: number,
    public pictureStartNumber: number,
    public tableStartNumber: number,
    public formulaStartNumber: number,
    public listId: number,
    public paragraphId: number,
    public characterInParagraph: number,
  ) {}

  static fromRecord(record: HWPRecord) {
    const reader = new ByteReader(record.data)
    const properties = new Properties(
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
    )

    if (!reader.isEOF()) {
      throw new Error('DocInfo: Properties: Reader is not EOF')
    }

    return properties
  }
}
