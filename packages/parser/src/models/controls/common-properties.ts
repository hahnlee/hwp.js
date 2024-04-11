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

import { getBitValue, getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import { SectionTagID } from '../../constants/tag-id.js'
import type { HWPVersion } from '../version.js'
import { ParagraphList } from './paragraph-list.js'

/**
 * 개체 공통 속성
 */
export class CommonProperties {
  constructor(
    /** 컨트롤 ID */
    public ctrlId: number,
    /** 글자처럼 취급 여부 */
    public treatAsChar: boolean,
    /**
     * 줄 간격에 영향을 줄지 여부
     * `treatAsChar` 속성이 true일 때에만 사용한다
     */
    public affectLetterSpacing: boolean,
    /**
     * 세로 위치의 기준
     * `treatAsChar` 속성이 true일 때에만 사용한다
     */
    public verticalRelativeTo: VerticalRelativeTo,
    /**
     * 세로 위치의 기준에 대한 상대적인 배열 방식
     * `treatAsChar` 속성이 true일 때에만 사용한다
     */
    public verticalAlign: Align | undefined,
    /**
     * 가로 위치의 기준
     * `treatAsChar` 속성이 true일 때에만 사용한다
     */
    public horizontalRelativeTo: HorizontalRelativeTo | undefined,
    /**
     * 가로 위치의 기준에 대한 상대적인 배열 방식
     * `treatAsChar` 속성이 true일 때에만 사용한다
     */
    public horizontalAlign: Align | undefined,
    /**
     * 오브젝트의 세로 위치를 본문 영역으로 제한할지 여부
     * `verticalRelativeTo` 속성이 Paragraph 일때만 사용한다
     */
    public flowWithText: boolean | undefined,
    /**
     * 다른 오브젝트와 겹치는 것을 허용할지 여부
     * `treatAsChar` 속성이 false일 때에만 사용한다
     * `flowWithText` 속성이 true면 무조건 false로 간주함
     */
    public allowOverlap: boolean | undefined,
    /** 오브젝트 폭의 기준 */
    public widthRelativeTo: WidthRelativeTo,
    /** 오브젝트 높이의 기준 */
    public heightRelativeTo: HeightRelativeTo,
    /**
     * 크기 보호 여부
     * `verticalRelativeTo` 속성이 Paragraph 일때만 사용한다
     */
    public protect: boolean | undefined,
    /**
     * 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션
     * `treatAsChar` 속성이 false일 때에만 사용한다
     */
    public textWrap: TextWrap | undefined,
    /**
     * 오브젝트의 좌/우 어느 쪽에 글을 배치할지 지정하는 옵션
     * `textWrap` 속성이 Square, Tight, Through 일때 사용한다
     */
    public textFlow: TextFlow | undefined,
    /** 이 개체가 속하는 번호 범주 */
    public numberingKind: NumberingKind,
    /** 오프셋 */
    public offset: Offset,
    /** 오브젝트의 폭 */
    public width: number,
    /** 오브젝트의 높이 */
    public height: number,
    /** z-order */
    public zOrder: number,
    /** 오브젝트의 바깥 4방향 여백 */
    public margin: [number, number, number, number],
    /** 문서 내 각 개체에 대한 고유 아이디 */
    public instanceId: number,
    /** 쪽 나눔 방지 */
    public preventPageBreak: boolean,
    /** 개체 설명문 */
    public description: string,
    /** 캡션 */
    public caption: Caption | undefined,
  ) {}

  static fromRecord(
    record: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
  ) {
    const reader = new ByteReader(record.data)
    const ctrlId = reader.readUInt32()

    const attribute = reader.readUInt32()
    const treatAsChar = getFlag(attribute, 0)
    const affectLetterSpacing = getFlag(attribute, 2)
    const verticalRelativeTo = mapVerticalRelativeTo(
      getBitValue(attribute, 3, 4),
    )
    const verticalAlign = treatAsChar
      ? mapAlign(getBitValue(attribute, 5, 7), verticalRelativeTo)
      : undefined
    const horizontalRelativeTo = mapHorizontalRelativeTo(
      getBitValue(attribute, 8, 9),
    )
    const horizontalAlign = treatAsChar
      ? mapAlign(getBitValue(attribute, 10, 12), horizontalRelativeTo)
      : undefined
    const flowWithText =
      verticalRelativeTo === VerticalRelativeTo.Paragraph
        ? getFlag(attribute, 13)
        : undefined
    const allowOverlap = treatAsChar
      ? undefined
      : flowWithText === true
      ? false
      : getFlag(attribute, 14)
    const widthRelativeTo = mapWidthRelativeTo(getBitValue(attribute, 15, 17))
    const heightRelativeTo = mapHeightRelativeTo(getBitValue(attribute, 18, 19))
    const protect =
      verticalRelativeTo === VerticalRelativeTo.Paragraph
        ? getFlag(attribute, 20)
        : undefined
    const textWrap = treatAsChar
      ? undefined
      : mapTextWrap(getBitValue(attribute, 21, 23))
    const textFlow =
      textWrap === TextWrap.Square ||
      textWrap === TextWrap.Tight ||
      textWrap === TextWrap.Through
        ? mapTextFlow(getBitValue(attribute, 24, 25))
        : undefined

    // NOTE: (@hahnlee) 배포용 문서에서 넘어가는 경우가 있음. 확인한 문서에서는 mod 값과 동일함
    const numberingKind = mapNumberingKind(getBitValue(attribute, 26, 28) % 4)

    const offset = new Offset(reader.readInt32(), reader.readInt32())

    const width = reader.readUInt32()
    const height = reader.readUInt32()
    const zOrder = reader.readInt32()

    const margin: [number, number, number, number] = [
      reader.readInt16(),
      reader.readInt16(),
      reader.readInt16(),
      reader.readInt16(),
    ]

    const instanceId = reader.readUInt32()

    const preventPageBreak = reader.readInt32() === 0

    // NOTE: (@hahnlee) len이 0이 아니라 아예 값이 없을 수도 있다
    const description = reader.remainByte() > 0 ? reader.readString() : ''

    if (!reader.isEOF()) {
      throw new Error('Control: Reader is not EOF')
    }

    const caption =
      iterator.peek().id === SectionTagID.HWPTAG_LIST_HEADER
        ? Caption.fromRecords(iterator, version)
        : undefined

    return new CommonProperties(
      ctrlId,
      treatAsChar,
      affectLetterSpacing,
      verticalRelativeTo,
      verticalAlign,
      horizontalRelativeTo,
      horizontalAlign,
      flowWithText,
      allowOverlap,
      widthRelativeTo,
      heightRelativeTo,
      protect,
      textWrap,
      textFlow,
      numberingKind,
      offset,
      width,
      height,
      zOrder,
      margin,
      instanceId,
      preventPageBreak,
      description,
      caption,
    )
  }
}

/** 세로 위치의 기준 */
export enum VerticalRelativeTo {
  Paper,
  Page,
  Paragraph,
}

function mapVerticalRelativeTo(value: number) {
  if (
    value >= VerticalRelativeTo.Paper &&
    value <= VerticalRelativeTo.Paragraph
  ) {
    return value as VerticalRelativeTo
  }
  throw new Error(`Unknown VerticalRelativeTo: ${value}`)
}

/** 배열 방식 */
export enum Align {
  Top,
  Center,
  Bottom,
  Left,
  Right,
  Inside,
  Outside,
}

function mapAlign(value: number, relTo: number) {
  if (relTo === 0 || relTo === 1) {
    switch (value) {
      case 0:
        return Align.Top
      case 1:
        return Align.Center
      case 2:
        return Align.Bottom
      case 3:
        return Align.Inside
      case 4:
        return Align.Outside
      default:
        throw new Error('잘못된 값입니다.')
    }
  } else {
    switch (value) {
      case 0:
        return Align.Left
      case 2:
        return Align.Right
      default:
        throw new Error('잘못된 값입니다.')
    }
  }
}

/** 가로 배열 방식 */
export enum HorizontalRelativeTo {
  Paper,
  Page,
  Column,
  Paragraph,
}

function mapHorizontalRelativeTo(value: number) {
  if (
    value >= HorizontalRelativeTo.Paper &&
    value <= HorizontalRelativeTo.Paragraph
  ) {
    return value as HorizontalRelativeTo
  }
  throw new Error(`Unknown HorizontalRelativeTo: ${value}`)
}

/** 오브젝트 폭의 기준 */
export enum WidthRelativeTo {
  Paper,
  Page,
  Column,
  Paragraph,
  Absolute,
}

function mapWidthRelativeTo(value: number) {
  if (value >= WidthRelativeTo.Paper && value <= WidthRelativeTo.Absolute) {
    return value as WidthRelativeTo
  }
  throw new Error(`Unknown WidthRelativeTo: ${value}`)
}

/** 오브젝트 높이의 기준 */
export enum HeightRelativeTo {
  Paper,
  Page,
  Absolute,
}

function mapHeightRelativeTo(value: number) {
  if (value >= HeightRelativeTo.Paper && value <= HeightRelativeTo.Absolute) {
    return value as HeightRelativeTo
  }
  throw new Error(`Unknown HeightRelativeTo: ${value}`)
}

/** 오브젝트 주위를 텍스트가 어떻게 흘러갈지 지정하는 옵션 */
export enum TextWrap {
  /** bound rect를 따라 */
  Square,
  /** 오브젝트의 outline을 따라 */
  Tight,
  /** 오브젝트 내부의 빈 공간까지 */
  Through,
  /** 좌, 우에는 텍스트를 배치하지 않음 */
  TopAndBottom,
  /** 글과 겹치게 하여 글 뒤로 */
  BehindText,
  /** 글과 겹치게 하여 글 앞으로 */
  InFrontOfText,
}

function mapTextWrap(value: number) {
  if (value >= TextWrap.Square && value <= TextWrap.InFrontOfText) {
    return value as TextWrap
  }
  throw new Error(`Unknown TextWrap: ${value}`)
}

/** 오브젝트의 좌/우 어느 쪽에 글을 배치할지 */
export enum TextFlow {
  BothSides,
  LeftOnly,
  RightOnly,
  LargestOnly,
}

function mapTextFlow(value: number) {
  if (value >= TextFlow.BothSides && value <= TextFlow.LargestOnly) {
    return value as TextFlow
  }
  throw new Error(`Unknown TextFlow: ${value}`)
}

/** 이 개체가 속하는 번호 범주 */
export enum NumberingKind {
  None,
  Figure,
  Table,
  Equation,
}

function mapNumberingKind(value: number) {
  if (value >= NumberingKind.None && value <= NumberingKind.Equation) {
    return value as NumberingKind
  }
  throw new Error(`Unknown NumberingKind: ${value}`)
}

export class Offset {
  constructor(
    /** 세로 */
    public vertical: number,
    /** 가로 */
    public horizontal: number,
  ) {}
}

export class Caption {
  constructor(
    /** 문단 리스트 */
    public paragraphs: ParagraphList,
    /** 방향 */
    public align: CaptionAlign,
    /** 캡션 폭에 마진을 포함할 지 여부 (가로 방향일 때만 사용) */
    public fullSize: boolean,
    /** 캡션 폭(세로 방향일 때만 사용) */
    public width: number,
    /** 캡션과 틀 사이 간격 */
    public gap: number,
    /** 텍스트의 최대 길이(=개체의 폭) */
    public lastWidth: number,
    /** 알 수 없는 값 */
    public unknown: ArrayBuffer | undefined,
  ) {}

  static fromRecords(
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
  ) {
    const record = iterator.next()
    if (record.id !== SectionTagID.HWPTAG_LIST_HEADER) {
      throw new Error('Caption: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const paragraphs = ParagraphList.fromReader(reader, iterator, version)

    const attribute = reader.readUInt32()
    const align = mapCaptionAlign(getBitValue(attribute, 0, 1))
    const fullSize = getFlag(attribute, 2)

    const width = reader.readUInt32()
    const gap = reader.readInt16()
    const lastWidth = reader.readUInt32()

    const unknown = reader.isEOF() ? undefined : reader.read(8)

    if (!reader.isEOF()) {
      throw new Error('Caption: Reader is not EOF')
    }

    return new Caption(
      paragraphs,
      align,
      fullSize,
      width,
      gap,
      lastWidth,
      unknown,
    )
  }
}

export enum CaptionAlign {
  Left,
  Right,
  Top,
  Bottom,
}

function mapCaptionAlign(value: number) {
  if (value >= CaptionAlign.Left && value <= CaptionAlign.Bottom) {
    return value as CaptionAlign
  }
  throw new Error(`Unknown CaptionAlign: ${value}`)
}
