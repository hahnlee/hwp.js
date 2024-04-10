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

import { getFlag } from '../utils/bit-utils.js'
import type { ByteReader } from '../utils/byte-reader.js'

export class LineSegment {
  constructor(
    /** 텍스트 시작 위치 */
    public startPosition: number,
    /** 줄의 세로 위치 */
    public verticalPosition: number,
    /** 줄의 높이 */
    public lineHeight: number,
    /** 텍스트 부분의 높이 */
    public textHeight: number,
    /** 줄의 세로 위치에서 베이스라인까지 거리 */
    public baseLineGap: number,
    /** 줄간격 */
    public lineSpacing: number,
    /** 컬럼에서의 시작 위치 */
    public startPositionInColumn: number,
    /** 세그먼트의 폭 */
    public width: number,
    /** 페이지의 첫 줄인지 여부 */
    public firstLineInPage: boolean,
    /** 컬럼의 첫 줄인지 여부 */
    public firstLineInColumn: boolean,
    /** 텍스트가 배열되지 않은 빈 세그먼트인지 여부 */
    public empty: boolean,
    /** 줄의 첫 세그먼트인지 여부 */
    public first: boolean,
    /** 줄의 마지막 세그먼트인지 여부 */
    public last: boolean,
    /** 줄의 마지막에 auto-hyphenation이 수행되었는지 여부. */
    public autoHyphenated: boolean,
    /** indentation 적용 */
    public indented: boolean,
    /** 문단 머리 모양 적용 */
    public heading: boolean,
  ) {}

  static fromReader(reader: ByteReader) {
    const startPosition = reader.readUInt32()
    const verticalPosition = reader.readInt32()
    const lineHeight = reader.readInt32()
    const textHeight = reader.readInt32()
    const baseLineGap = reader.readInt32()
    const lineSpacing = reader.readInt32()
    const startPositionInColumn = reader.readInt32()
    const width = reader.readInt32()

    const tag = reader.readUInt32()
    const firstLineInPage = getFlag(tag, 0)
    const firstLineInColumn = getFlag(tag, 1)
    const empty = getFlag(tag, 16)
    const first = getFlag(tag, 17)
    const last = getFlag(tag, 18)
    const autoHyphenated = getFlag(tag, 19)
    const indented = getFlag(tag, 20)
    const heading = getFlag(tag, 21)

    return new LineSegment(
      startPosition,
      verticalPosition,
      lineHeight,
      textHeight,
      baseLineGap,
      lineSpacing,
      startPositionInColumn,
      width,
      firstLineInPage,
      firstLineInColumn,
      empty,
      first,
      last,
      autoHyphenated,
      indented,
      heading,
    )
  }
}
