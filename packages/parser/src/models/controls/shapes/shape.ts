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

import { SectionTagID } from '../../../constants/tag-id.js'
import type { ParseOptions } from '../../../types/parser.js'
import type { PeekableIterator } from '../../../utils/generator.js'
import type { HWPRecord } from '../../record.js'
import type { HWPVersion } from '../../version.js'
import { CommonProperties } from '../common-properties.js'
import { DrawText } from '../draw-text.js'
import { ElementProperties } from '../element-properties.js'
import { type ShapeObjectContent, parseContent } from './content.js'

/**
 * 그리기 객체
 */
export class GenShapeObjectControl {
  constructor(
    /** 개체 공통 속성 */
    public commonProperties: CommonProperties,
    /** 개체 요소 속성 */
    public elementProperties: ElementProperties,
    /** 글상자 */
    public drawText: DrawText | null,
    /** 컨텐츠 */
    public content: ShapeObjectContent,
  ) {}

  static fromRecord(
    record: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
    options: ParseOptions,
  ) {
    const commonProperties = CommonProperties.fromRecord(
      record,
      iterator,
      version,
      options,
    )

    const elementProperties = ElementProperties.fromRecords(iterator, true)

    const drawText =
      iterator.peek().id === SectionTagID.HWPTAG_LIST_HEADER
        ? DrawText.fromRecords(iterator, version, options)
        : null

    const content = parseContent(elementProperties, record, iterator)

    return new GenShapeObjectControl(
      commonProperties,
      elementProperties,
      drawText,
      content,
    )
  }
}
