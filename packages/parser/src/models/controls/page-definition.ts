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

import { SectionTagID } from '../../constants/tag-id.js'
import { getBitValue } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { HWPRecord } from '../record.js'

/** 페이지 정의 */
export class PageDefinition {
  constructor(
    /** 용지 가로 크기 */
    public width: number,
    /** 용지 세로 크기 */
    public height: number,
    /** 여백 */
    public padding: Padding,
    /** 용지방향 */
    public landscape: Landscape,
    /** 제책 방법 */
    public gutterKind: GutterKind,
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== SectionTagID.HWPTAG_PAGE_DEF) {
      throw new Error('PageDefinition: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const width = reader.readUInt32()
    const height = reader.readUInt32()
    const padding = new Padding(
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
    )

    const properties = reader.readUInt32()
    const landscape = mapLandscape(getBitValue(properties, 0, 1))
    const gutterKind = mapGutterKind(getBitValue(properties, 1, 2))

    if (!reader.isEOF()) {
      throw new Error('PageDefinition: Reader is not EOF')
    }

    return new PageDefinition(width, height, padding, landscape, gutterKind)
  }
}

export class Padding {
  constructor(
    public left: number,
    public right: number,
    public top: number,
    public bottom: number,
    /** 머리말 여백 */
    public header: number,
    /** 꼬리말 여백 */
    public footer: number,
    /** 제본 여백 */
    public binding: number,
  ) {}
}

export enum Landscape {
  /** 좁게 */
  Narrowly,
  /** 넓게 */
  Widely,
}

function mapLandscape(value: number): Landscape {
  switch (value) {
    case 0:
      return Landscape.Narrowly
    case 1:
      return Landscape.Widely
    default:
      throw new Error(`PageDefinition: Landscape: Invalid landscape: ${value}`)
  }
}

export enum GutterKind {
  /** 한쪽 편집 */
  LeftOnly,
  /** 맞쪽 편집 */
  LeftRight,
  /** 위로 넘기기 */
  TopBottom,
}

function mapGutterKind(value: number): GutterKind {
  switch (value) {
    case 0:
      return GutterKind.LeftOnly
    case 1:
      return GutterKind.LeftRight
    case 2:
      return GutterKind.TopBottom
    default:
      throw new Error(
        `PageDefinition: GutterKind: Invalid gutter kind: ${value}`,
      )
  }
}
