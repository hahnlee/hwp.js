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

import { LineSegment } from './line-segment.js'
import { Control } from './controls/index.js'
import { ParagraphHeader } from './paragraph-header.js'
import type { PeekableIterator } from '../utils/generator.js'
import { HWPRecord } from './record.js'
import { HWPVersion } from './version.js'
import { SectionTagID } from '../constants/tag-id.js'
import { ByteReader } from '../utils/byte-reader.js'
import { CharList } from './char-list.js'
import { collectChildren } from '../utils/record.js'
import { RangeTag } from './range-tag.js'
import { CharShape } from './char-shape.js'
import type { ParseOptions } from '../types/parser.js'
import { parseControl } from './controls/content.js'

export class Paragraph {
  constructor(
    public header: ParagraphHeader,
    public chars: CharList,
    public charShapes: CharShape[],
    public lineSegments: LineSegment[],
    public rangeTags: RangeTag[],
    public controls: Control[],
  ) {}

  static fromRecord(
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
    options: ParseOptions,
  ) {
    const current = iterator.next()
    const header = ParagraphHeader.fromRecord(current, version)

    // NOTE: (@hahnlee) 문서와 달리 header.chars가 0보다 커도 없을 수 있다.
    const chars =
      iterator.peek().id === SectionTagID.HWPTAG_PARA_TEXT
        ? CharList.fromRecord(iterator.next(), header.chars)
        : CharList.empty()

    const charShapes: CharShape[] = []
    if (header.charShapes > 0) {
      const record = iterator.next()
      if (record.id !== SectionTagID.HWPTAG_PARA_CHAR_SHAPE) {
        throw new Error('BodyText: CharShape: Record has wrong ID')
      }
      const reader = new ByteReader(record.data)
      for (let i = 0; i < header.charShapes; i++) {
        charShapes.push(CharShape.fromReader(reader))
      }
      if (!reader.isEOF()) {
        throw new Error('BodyText: CharShape: Reader is not EOF')
      }
    }

    const lineSegments: LineSegment[] = []
    if (header.aligns > 0) {
      const record = iterator.next()
      if (record.id !== SectionTagID.HWPTAG_PARA_LINE_SEG) {
        throw new Error('BodyText: LineSegment: Record has wrong ID')
      }
      const reader = new ByteReader(record.data)
      for (let i = 0; i < header.aligns; i++) {
        lineSegments.push(LineSegment.fromReader(reader))
      }
      if (!reader.isEOF()) {
        throw new Error('BodyText: LineSegment: Reader is not EOF')
      }
    }

    const rangeTags: RangeTag[] = []
    if (header.ranges > 0) {
      const record = iterator.next()
      if (record.id !== SectionTagID.HWPTAG_PARA_RANGE_TAG) {
        throw new Error('BodyText: RangeTag: Record has wrong ID')
      }
      const reader = new ByteReader(record.data)
      for (let i = 0; i < header.ranges; i++) {
        rangeTags.push(RangeTag.fromReader(reader))
      }

      if (!reader.isEOF()) {
        throw new Error('BodyText: RangeTag: Reader is not EOF')
      }
    }

    const controls: Control[] = chars
      .extendedControls()
      .map(() => parseControl(iterator, version, options))

    const unknown = collectChildren(iterator, current.level)

    if (options.strict && unknown.length > 0) {
      throw new Error('BodyText: Paragraph: Unknown records')
    }

    return new Paragraph(
      header,
      chars,
      charShapes,
      lineSegments,
      rangeTags,
      controls,
    )
  }

  toString() {
    return this.chars.toString()
  }
}
