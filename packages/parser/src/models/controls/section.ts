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
import { getBitValue, getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import { Border } from '../doc-info/border-fill.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'
import { Control } from './control.js'
import { PageDefinition } from './page-definition.js'

export class SectionControl extends Control {
  constructor(
    public id: number,
    /** 컨트롤 ID */
    public ctrlId: number,
    /** 머리말을 감출지 여부 */
    public hideHeader: boolean,
    /** 꼬리말을 감출지 여부 */
    public hideFooter: boolean,
    /** 바탕쪽 숨김 여부 */
    public hideMasterPage: boolean,
    /** 테두리 숨김 여부 */
    public hideBorder: boolean,
    /** 배경 숨김 여부 */
    public hideFill: boolean,
    /** 페이지 번호 숨김 여부 */
    public hidePageNumber: boolean,
    /** 구역의 첫 쪽에만 테두리 표시 여부 */
    public borderOnFirstPage: boolean,
    /** 구역의 첫 쪽에만 배경 표시 여부 */
    public fillOnFirstPage: boolean,
    /** 텍스트 방향 */
    public textDirection: TextDirection,
    /** 빈 줄 감춤 여부 */
    public hideEmptyLine: boolean,
    /** 구역 나눔으로 새 페이지가 생길 때의 페이지 번호 적용할지 여부 */
    public newPageNumber: boolean,
    /** 원고지 정서법 적용 여부 */
    public manuscriptPaperOrthography: boolean,
    /** 동일한 페이지에서 서로 다른 단 사이의 간격 */
    public columnSpace: number,
    /** 세로 줄맞춤 간격 */
    public verticalAlignment: number,
    /** 가로 줄맛춤 간격 */
    public horizontalAlignment: number,
    /** 기본 탭 간격 */
    public tabSpace: number,
    /** 번호 문단 모양 ID */
    public numberingId: number,
    /** 쪽 번호 */
    public pageNumber: number,
    /** 그림 번호 */
    public pictureNumber: number,
    /** 표 번호 */
    public tableNumber: number,
    /** 수식 번호 */
    public equationNumber: number,
    /**
     * 언어코드 (5.0.1.5 이상)
     * @link https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oe376/6c085406-a698-4e12-9d4d-c3b0ee3dbc4a
     */
    public langId: number | undefined,
    /** 용지설정 정보 */
    public pageDefinition: PageDefinition,
    /** 각주 모양 정보 */
    public footnoteShape: FootnoteEndnoteShape,
    /** 미주 모양 정보 */
    public endnoteShape: FootnoteEndnoteShape,
    public unknown: ArrayBuffer,
  ) {
    super(id)
  }

  static fromRecord(
    id: number,
    record: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
  ) {
    const reader = new ByteReader(record.data)

    const ctrlId = reader.readUInt32()

    const attribute = reader.readUInt32()
    const hideHeader = getFlag(attribute, 0)
    const hideFooter = getFlag(attribute, 1)
    const hideMasterPage = getFlag(attribute, 2)
    const hideBorder = getFlag(attribute, 3)
    const hideFill = getFlag(attribute, 4)
    const hidePageNumber = getFlag(attribute, 5)
    const borderOnFirstPage = getFlag(attribute, 8)
    const fillOnFirstPage = getFlag(attribute, 9)
    const textDirection = mapTextDirection(getBitValue(attribute, 16, 18))
    const hideEmptyLine = getFlag(attribute, 19)
    const newPageNumber = getBitValue(attribute, 20, 21) === 0 ? false : true
    const manuscriptPaperOrthography = getFlag(attribute, 22)

    const columnSpace = reader.readInt16()
    const verticalAlignment = reader.readInt16()
    const horizontalAlignment = reader.readInt16()

    const tabSpace = reader.readUInt32()
    const numberingId = reader.readUInt16()

    const pageNumber = reader.readUInt16()
    const pictureNumber = reader.readUInt16()
    const tableNumber = reader.readUInt16()
    const equationNumber = reader.readUInt16()

    const langId = version.gte(new HWPVersion(5, 0, 1, 5))
      ? reader.readUInt16()
      : undefined

    const unknown = reader.read(reader.remainByte())

    const pageDefinition = PageDefinition.fromRecord(iterator.next())
    const footnoteShape = FootnoteEndnoteShape.fromRecord(iterator.next())
    const endnoteShape = FootnoteEndnoteShape.fromRecord(iterator.next())

    // NOTE: (@hahnlee) 양쪽, 홀수, 짝수 정보가 반복됨.
    // TODO: (@hahnlee) 항상 모든 모든 정보를 내려주는지 확인필요

    if (iterator.next().id !== SectionTagID.HWPTAG_PAGE_BORDER_FILL) {
      throw new Error('BodyText: SectionControl: Record has wrong ID')
    }

    if (iterator.next().id !== SectionTagID.HWPTAG_PAGE_BORDER_FILL) {
      throw new Error('BodyText: SectionControl: Record has wrong ID')
    }

    if (iterator.next().id !== SectionTagID.HWPTAG_PAGE_BORDER_FILL) {
      throw new Error('BodyText: SectionControl: Record has wrong ID')
    }

    // TODO: (@hahnlee) 바탕쪽 정보 관련된 파싱 추가하기

    return new SectionControl(
      id,
      ctrlId,
      hideHeader,
      hideFooter,
      hideMasterPage,
      hideBorder,
      hideFill,
      hidePageNumber,
      borderOnFirstPage,
      fillOnFirstPage,
      textDirection,
      hideEmptyLine,
      newPageNumber,
      manuscriptPaperOrthography,
      columnSpace,
      verticalAlignment,
      horizontalAlignment,
      tabSpace,
      numberingId,
      pageNumber,
      pictureNumber,
      tableNumber,
      equationNumber,
      langId,
      pageDefinition,
      footnoteShape,
      endnoteShape,
      unknown,
    )
  }
}

export enum TextDirection {
  Horizontal,
  Vertical,
}

function mapTextDirection(value: number): TextDirection {
  if (value === TextDirection.Horizontal || value === TextDirection.Vertical) {
    return value
  }
  throw new Error(`Unknown TextDirection: ${value}`)
}

/** 각주 / 미주 모양 */
export class FootnoteEndnoteShape {
  constructor(
    /** 번호 모양 */
    public numberShape: NumberShape,
    /** 사용자 기호 */
    public userChar: string,
    /** 앞 장식 문자 */
    public prefixChar: string,
    /** 뒤 장식 문자 */
    public suffixChar: string,
    /** 시작 번호 */
    public startNumber: number,
    /** 구분선 위 여백 */
    public marginTop: number,
    /** 구분선 아래 여백 */
    public marginBottom: number,
    /** 주석 사이 여백 */
    public commentMargin: number,
    /** 구분선 길이 */
    public divideLineLength: number,
    /** 구분선 */
    public border: Border,
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== SectionTagID.HWPTAG_FOOTNOTE_SHAPE) {
      throw new Error('BodyText: FootnoteEndnoteShape: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const attribute = reader.readUInt32()
    // TODO: (@hahnlee) 속성 파싱
    const numberShape = mapNumberShape(getBitValue(attribute, 0, 7))

    const userChar = String.fromCharCode(reader.readUInt16())
    const prefixChar = String.fromCharCode(reader.readUInt16())
    const suffixChar = String.fromCharCode(reader.readUInt16())

    const startNumber = reader.readUInt16()

    // 공식 문서와 다르게 실제로는 4바이트다
    const divideLineLength = reader.readUInt32()

    const marginTop = reader.readInt16()
    const marginBottom = reader.readInt16()

    const commentMargin = reader.readInt16()

    const border = Border.fromReader(reader)

    if (!reader.isEOF()) {
      throw new Error('BodyText: FootnoteEndnoteShape: Reader is not EOF')
    }

    return new FootnoteEndnoteShape(
      numberShape,
      userChar,
      prefixChar,
      suffixChar,
      startNumber,
      marginTop,
      marginBottom,
      commentMargin,
      divideLineLength,
      border,
    )
  }
}

/** 번호종류, hwpx 표준문서 참고 */
export enum NumberShape {
  /** 1, 2, 3 */
  Digit,
  /** 동그라미 쳐진 1, 2, 3 */
  CircledDigit,
  /** I, II, III */
  RomanCapital,
  /** i, ii, iii */
  RomanSmall,
  /** A, B, C .. Z */
  LatinCapital,
  /** a, b, c, ... z */
  LatinSmall,
  /** 동그라미 쳐진 A, B, C */
  CircledLatinCapital,
  /** 동그라미 쳐진 a, b, c */
  CircledLatinSmall,
  /** 가, 나, 다 */
  HangulSyllable,
  /** 동그라미 쳐진 가,나,다 */
  CircledHangulSyllable,
  /** ᄀ, ᄂ, ᄃ */
  HangulJamo,
  /** 동그라미 쳐진 ᄀ,ᄂ,ᄃ */
  CircledHangulJamo,
  /** 일, 이, 삼 */
  HangulPhonetic,
  /** 一, 二, 三 */
  Ideograph,
  /** 동그라미 쳐진 一,二,三 */
  CircledIdeograph,
  /** 갑, 을, 병, 정, 무, 기, 경, 신, 임, 계 */
  DecagonCircle,
  /** 甲, 乙, 丙, 丁, 戊, 己, 庚, 辛, 壬, 癸 */
  DecagonCircleHanja,
  /** 4가지 문자가 차례로 반복 */
  Symbol = 0x80,
  /** 사용자 지정 문자 반복 */
  UserChar = 0x81,
}

function mapNumberShape(value: number): NumberShape {
  if (value >= NumberShape.Digit && value <= NumberShape.DecagonCircleHanja) {
    return value as NumberShape
  }
  if (value === NumberShape.Symbol || value === NumberShape.UserChar) {
    return value as NumberShape
  }
  throw new Error(`Unknown NumberShape: ${value}`)
}
