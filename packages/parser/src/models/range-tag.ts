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

import type { ByteReader } from '../utils/byte-reader.js'

export class RangeTag {
  constructor(
    /** 영역 시작 */
    public startPosition: number,
    /** 영역 끝 */
    public endPosition: number,
    /**
     * 태그(종류 + 데이터)
     * 상위 8비트가 종류를 하위 24비트가 종류별로 다른
     * 설명을 부여할 수 있는 임의의 데이터를 나타낸다.
     */
    public tag: number,
  ) {}

  static fromReader(reader: ByteReader) {
    const startPosition = reader.readUInt32()
    const endPosition = reader.readUInt32()
    const tag = reader.readUInt32()

    return new RangeTag(startPosition, endPosition, tag)
  }
}
