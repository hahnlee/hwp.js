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

import type { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import type { HWPVersion } from '../version.js'
import { Paragraph } from '../paragraph.js'

/**
 * 문단 리스트
 */
export class ParagraphList {
  constructor(
    public header: ParagraphListHeader,
    private paragraphs: Paragraph[],
  ) {}

  static fromReader(
    reader: ByteReader,
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
  ) {
    const header = ParagraphListHeader.fromReader(reader)

    // NOTE: 나머지 속성은 사용처에서 파싱해야함
    const paragraphs: Paragraph[] = []
    for (let i = 0; i < header.count; i++) {
      paragraphs.push(Paragraph.fromRecord(iterator, version))
    }

    return new ParagraphList(header, paragraphs)
  }

  *[Symbol.iterator]() {
    for (const paragraph of this.paragraphs) {
      yield paragraph
    }
  }

  get(index: number) {
    return this.paragraphs[index]
  }

  set(index: number, paragraph: Paragraph) {
    this.paragraphs[index] = paragraph
  }

  get length() {
    return this.paragraphs.length
  }

  toString() {
    return this.paragraphs.map((paragraph) => paragraph.toString()).join('\n')
  }
}

/**
 * 문단 리스트 해더
 */
export class ParagraphListHeader {
  constructor(
    /** 문단 수 */
    public count: number,
    /** 방향 */
    public direction: Direction,
    /** 문단의 줄바꿈 */
    public lineBreak: LineBreak,
    /** 세로 정렬 */
    public verticalAlign: ParagraphListVerticalAlign,
  ) {}

  static fromReader(reader: ByteReader) {
    // NOTE: (@hahnlee) 문서에는 2바이트로 나와있으나, 실제론 4바이트를 읽어야함
    const count = reader.readUInt32()

    const attribute = reader.readUInt32()
    const direction = mapDirection((attribute >> 0) & 0b11)
    const lineBreak = mapLineBreak((attribute >> 3) & 0b11)
    const verticalAlign = mapVerticalAlign((attribute >> 5) & 0b11)

    return new ParagraphListHeader(count, direction, lineBreak, verticalAlign)
  }
}

export enum Direction {
  Horizontal,
  Vertical,
}

function mapDirection(value: number) {
  if (value >= Direction.Horizontal && value <= Direction.Vertical) {
    return value as Direction
  }
  throw new Error(`Unknown Direction: ${value}`)
}

export enum LineBreak {
  /** 일반적인 줄바꿈 */
  Normal,
  /** 자간을 조종하여 한 줄을 유지 */
  SingleLine,
  /** 내용에 따라 폭이 늘어남 */
  Dynamic,
}

function mapLineBreak(value: number) {
  if (value >= LineBreak.Normal && value <= LineBreak.Dynamic) {
    return value as LineBreak
  }
  throw new Error(`Unknown LineBreak: ${value}`)
}

export enum ParagraphListVerticalAlign {
  Top,
  Center,
  Bottom,
}

function mapVerticalAlign(value: number) {
  if (
    value >= ParagraphListVerticalAlign.Top &&
    value <= ParagraphListVerticalAlign.Bottom
  ) {
    return value as ParagraphListVerticalAlign
  }
  throw new Error(`Unknown VerticalAlign: ${value}`)
}
