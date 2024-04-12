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

import { DocInfoTagID } from '../../constants/tag-id.js'
import { getBitValue, getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'

export class ParagraphShape {
  constructor(
    /** 줄 간격 종류. 한/글 2007 이하 버전에서 사용. */
    public lineSpaceKindOld: LineSpacingKind,
    /** 정렬 방식 */
    public align: TextAlign,
    /** 라틴 문자의 줄나눔 단위 */
    public breakLatinWord: BreakLatinWord,
    /** 라틴 문자 이외의 줄나눔 단위 */
    public breakNonLatinWord: BreakNonLatinWord,
    /** 편집 용지의 줄 격자 사용 여부 */
    public snapToGrid: boolean,
    /** 공백 최소값 */
    public condense: number,
    /** 외톨이줄 보호 여부 */
    public widowOrphan: boolean,
    /** 다음 문단과 함께 여부 */
    public keepWithNext: boolean,
    /** 문단 보호 여부 */
    public keepLines: boolean,
    /** 문단 앞에서 항상 쪽 나눔 여부 */
    public pageBreakBefore: boolean,
    /** 세로 정렬 */
    public verticalAlign: VerticalAlign,
    /** 글꼴에 어울리는 줄 높이 여부 */
    public fontLineHeight: boolean,
    /** 문단 머리 모양 종류 */
    public headingKind: ParagraphHeadingKind,
    /** 문단 수준 */
    public headingLevel: number,
    /** 문단 테두리 연결 여부 */
    public borderConnect: boolean,
    /** 문단 여백 무시 여부 */
    public borderIgnoreMargin: boolean,
    /** 문단 꼬리 모양 */
    public tailing: number,
    /** 왼쪽 여백 */
    public paddingLeft: number,
    /** 오른쪽 여백 */
    public paddingRight: number,
    /** 들여 쓰기/내어 쓰기 */
    public indent: number,
    /** 문단 간격 위 */
    public marginTop: number,
    /** 문단 간격 아래 */
    public marginBottom: number,
    /** 줄 간격. 한글 2007 이하 버전(5.0.2.5 버전 미만)에서 사용. */
    public lineSpaceOld: number,
    /** 탭 정의 아이디(TabDef ID) 참조 값 */
    public tabDefinitionId: number,
    /** 번호 문단 ID(Numbering ID) 또는 글머리표 문단 모양 ID(Bullet ID) 참조 값 */
    public numberingBulletId: number,
    /** 테두리/배경 모양 ID(BorderFill ID) 참조 값 */
    public borderFillId: number,
    /** 문단 테두리 왼쪽 간격 */
    public borderOffsetLeft: number,
    /** 문단 테두리 오른쪽 간격 */
    public borderOffsetRight: number,
    /** 문단 테두리 위쪽 간격 */
    public borderOffsetTop: number,
    /** 문단 테두리 아래쪽 간격 */
    public borderOffsetBottom: number,
  ) {}
  /** 한 줄로 입력 여부 (5.0.1.7 버전 이상) */
  public singleLine?: boolean
  /** 한글과 영어 간격을 자동 조절 여부 (5.0.1.7 버전 이상) */
  public autoSpacingKrEng?: boolean
  /** 한글과 숫자 간격을 자동 조절 여부 (5.0.1.7 버전 이상) */
  public autoSpacingKrNum?: boolean
  /** 줄 간격 종류 (5.0.2.5 버전 이상) */
  public lineSpacingKind?: LineSpacingKind
  /** 줄 간격 (5.0.2.5 버전 이상) */
  public lineSpacing?: number
  /** 개요 수준 (5.1.0.0 버전 이상) */
  public paraLevel?: number

  static fromRecord(record: HWPRecord, version: HWPVersion) {
    if (record.id !== DocInfoTagID.HWPTAG_PARA_SHAPE) {
      throw new Error('DocInfo: ParagraphShape: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const attribute = reader.readUInt32()
    const lineSpaceKindOld = mapLineSpacingKind(getBitValue(attribute, 0, 1))
    const align = mapAlign(getBitValue(attribute, 2, 4))
    const breakLatinWord = mapBreakLatinWord(getBitValue(attribute, 5, 6))
    const breakNonLatinWord = mapBreakNonLatinWord(getBitValue(attribute, 7, 7))
    const snapToGrid = getFlag(attribute, 8)
    const condense = getBitValue(attribute, 9, 15)
    const widowOrphan = getFlag(attribute, 16)
    const keepWithNext = getFlag(attribute, 17)
    const keepLines = getFlag(attribute, 18)
    const pageBreakBefore = getFlag(attribute, 19)
    const verticalAlign = mapVerticalAlign(getBitValue(attribute, 20, 21))
    const fontLineHeight = getFlag(attribute, 22)
    const headingKind = mapParagraphHeadingKind(getBitValue(attribute, 23, 24))
    const headingLevel = getBitValue(attribute, 25, 27)
    const borderConnect = getFlag(attribute, 28)
    const borderIgnoreMargin = getFlag(attribute, 29)
    const tailing = getBitValue(attribute, 30, 30)

    const paddingLeft = reader.readInt32()
    const paddingRight = reader.readInt32()

    const indent = reader.readInt32()

    const marginTop = reader.readInt32()
    const marginBottom = reader.readInt32()

    const lineSpaceOld = reader.readInt32()

    const tabDefinitionId = reader.readUInt16()
    const numberingBulletId = reader.readUInt16()
    const borderFillId = reader.readUInt16()

    const borderOffsetLeft = reader.readInt16()
    const borderOffsetRight = reader.readInt16()
    const borderOffsetTop = reader.readInt16()
    const borderOffsetBottom = reader.readInt16()

    const paragraphShape = new ParagraphShape(
      lineSpaceKindOld,
      align,
      breakLatinWord,
      breakNonLatinWord,
      snapToGrid,
      condense,
      widowOrphan,
      keepWithNext,
      keepLines,
      pageBreakBefore,
      verticalAlign,
      fontLineHeight,
      headingKind,
      headingLevel,
      borderConnect,
      borderIgnoreMargin,
      tailing,
      paddingLeft,
      paddingRight,
      indent,
      marginTop,
      marginBottom,
      lineSpaceOld,
      tabDefinitionId,
      numberingBulletId,
      borderFillId,
      borderOffsetLeft,
      borderOffsetRight,
      borderOffsetTop,
      borderOffsetBottom,
    )

    if (version.gte(new HWPVersion(5, 0, 1, 7))) {
      const attributeV2 = reader.readUInt32()
      paragraphShape.singleLine = getBitValue(attributeV2, 0, 1) > 0
      paragraphShape.autoSpacingKrEng = getFlag(attributeV2, 4)
      paragraphShape.autoSpacingKrNum = getFlag(attributeV2, 5)
    }

    if (version.gte(new HWPVersion(5, 0, 2, 5))) {
      const attributeV3 = reader.readUInt32()
      paragraphShape.lineSpacingKind = mapLineSpacingKind(
        getBitValue(attributeV3, 0, 4),
      )
      paragraphShape.lineSpacing = reader.readUInt32()
    }

    if (version.gte(new HWPVersion(5, 1, 0, 0))) {
      paragraphShape.paraLevel = reader.readUInt32()
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: ParagraphShape: Reader is not EOF')
    }

    return paragraphShape
  }
}

export enum TextAlign {
  /** 양쪽 정렬 */
  Justify,
  /** 왼쪽 정렬 */
  Left,
  /** 오른쪽 정렬 */
  Right,
  /** 가운데 정렬 */
  Center,
  /** 배분 정렬 */
  Distributive,
  /** 나눔 정렬 */
  DistributiveSpace,
}

function mapAlign(value: number) {
  if (value >= TextAlign.Justify && value <= TextAlign.DistributiveSpace) {
    return value as TextAlign
  }
  throw new Error(`Unknown Align: ${value}`)
}

export enum BreakLatinWord {
  /** 단어 */
  KeepWord,
  /** 하이픈 */
  Hyphenation,
  /** 글자 */
  BreakWord,
}

function mapBreakLatinWord(value: number) {
  if (value >= BreakLatinWord.KeepWord && value <= BreakLatinWord.BreakWord) {
    return value as BreakLatinWord
  }
  throw new Error(`Unknown BreakLatinWord: ${value}`)
}

export enum BreakNonLatinWord {
  /** 단어 */
  KeepWord,
  /** 글자 */
  BreakWord,
}

function mapBreakNonLatinWord(value: number) {
  if (
    value >= BreakNonLatinWord.KeepWord &&
    value <= BreakNonLatinWord.BreakWord
  ) {
    return value as BreakNonLatinWord
  }
  throw new Error(`Unknown BreakNonLatinWord: ${value}`)
}

export enum VerticalAlign {
  /** 글꼴기준 */
  Baseline,
  /** 위쪽 */
  Top,
  /** 가운데 */
  Center,
  /** 아래 */
  Bottom,
}

function mapVerticalAlign(value: number) {
  if (value >= VerticalAlign.Baseline && value <= VerticalAlign.Bottom) {
    return value as VerticalAlign
  }
  throw new Error(`Unknown VerticalAlign: ${value}`)
}

export enum ParagraphHeadingKind {
  /** 없음 */
  None,
  /** 개요 */
  Outline,
  /** 번호 */
  Number,
  /** 글머리표 */
  Bullet,
}

function mapParagraphHeadingKind(value: number) {
  if (
    value >= ParagraphHeadingKind.None &&
    value <= ParagraphHeadingKind.Bullet
  ) {
    return value as ParagraphHeadingKind
  }
  throw new Error(`Unknown ParagraphHeadingKind: ${value}`)
}

export enum LineSpacingKind {
  /** 글자에 따라 (%) */
  Percent,
  /** 고정값 */
  Fixed,
  /** 여백만 지정 */
  BetweenLine,
  /** 최소 (5.0.2.5 버전 이상) */
  AtLeast,
}

function mapLineSpacingKind(value: number) {
  if (value >= LineSpacingKind.Percent && value <= LineSpacingKind.AtLeast) {
    return value as LineSpacingKind
  }
  throw new Error(`Unknown LineSpacingKind: ${value}`)
}
