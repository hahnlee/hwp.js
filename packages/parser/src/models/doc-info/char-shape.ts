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
import { ColorRef } from '../color-ref.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'
import { BorderKind, mapBorderKind } from './border-fill.js'
import { ByteReader } from '../../utils/byte-reader.js'
import { DocInfoTagID } from '../../constants/tag-id.js'

type SupportedLocaleOptions = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export class CharShapeStyle {
  constructor(
    /** 언어별 글꼴 ID(FaceID) 참조 값 */
    public fontIds: SupportedLocaleOptions,
    /** 언어별 장평, 50%～200% */
    public fontScales: SupportedLocaleOptions,
    /** 언어별 자간 */
    public fontSpacings: SupportedLocaleOptions,
    /** 언어별 상대 크기, 10%～250% */
    public fontSizes: SupportedLocaleOptions,
    /** 언어별 글자 위치, -100%～100% */
    public fontPositions: SupportedLocaleOptions,
    /** 기준 크기, 0pt～4096pt */
    public fontBaseSize: number,
    /** 기울임 여부 */
    public italic: boolean,
    /** 진하게 여부 */
    public bold: boolean,
    /** 밑줄 종류 */
    public underlineKind: UnderlineKind,
    /** 밑줄 모양 */
    public underlineShape: BorderKind,
    /** 외곽선 종류 */
    public outlineKind: OutlineKind,
    /** 그림자 종류 */
    public shadowKind: CharShadowKind,
    /** 양각여부 */
    public emboss: boolean,
    /** 음각여부 */
    public engrave: boolean,
    /** 위 첨자 여부 */
    public supscript: boolean,
    /** 아래 첨자 여부 */
    public subscript: boolean,
    /** 취소선 여부 */
    public strike: boolean,
    /** 강조점 종류 */
    public symMark: SymMark,
    /** 글꼴에 어울리는 빈칸 사용 여부 */
    public useFontSpace: boolean,
    /** 취소선 모양 */
    public strikeShape: BorderKind,
    /** Kerning 여부 */
    public useKerning: boolean,
    /** 그림자 간격 X, -100%～100% */
    public shadowOffsetX: number,
    /** 그림자 간격 Y, -100%～100% */
    public shadowOffsetY: number,
    /** 글자 색 */
    public color: ColorRef,
    /** 밑줄 색 */
    public underlineColor: ColorRef,
    /** 음영 색 */
    public shadeColor: ColorRef,
    /** 그림자 색 */
    public shadowColor: ColorRef,
  ) {}
  /** 글자 테두리/배경ID 참조 값 (5.0.2.1 이상) */
  public borderFillId?: number
  /** 취소선 색 (5.0.3.0 이상) */
  public strikeColor?: ColorRef

  static fromRecord(record: HWPRecord, version: HWPVersion) {
    if (record.id !== DocInfoTagID.HWPTAG_CHAR_SHAPE) {
      throw new Error('DocInfo: CharShape: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const fontIds: SupportedLocaleOptions = [
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
    ]

    const fontScales: SupportedLocaleOptions = [
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
    ]

    const fontSpacings: SupportedLocaleOptions = [
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
    ]

    const fontSizes: SupportedLocaleOptions = [
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt8(),
    ]

    const fontPositions: SupportedLocaleOptions = [
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
      reader.readInt8(),
    ]

    const baseSize = reader.readInt32()

    const attribute = reader.readUInt32()
    const italic = getFlag(attribute, 0)
    const bold = getFlag(attribute, 1)
    const underlineKind = mapUnderlineKind(getBitValue(attribute, 2, 3))
    const underlineShape = mapBorderKind(getBitValue(attribute, 4, 7))
    const outlineKind = mapOutlineKind(getBitValue(attribute, 8, 10))
    const shadowKind = mapShadowKind(getBitValue(attribute, 11, 12))
    const emboss = getFlag(attribute, 13)
    const engrave = getFlag(attribute, 14)
    const supscript = getFlag(attribute, 15)
    const subscript = getFlag(attribute, 16)
    const strike = getBitValue(attribute, 18, 20) > 0
    const symMark = mapSymMark(getBitValue(attribute, 21, 24))
    const useFontSpace = getFlag(attribute, 25)
    const strikeShape = mapBorderKind(getBitValue(attribute, 26, 29))
    const useKerning = getFlag(attribute, 30)

    const shadowOffsetX = reader.readUInt8()
    const shadowOffsetY = reader.readUInt8()

    const color = ColorRef.fromBits(reader.readUInt32())
    const underlineColor = ColorRef.fromBits(reader.readUInt32())

    const shadeColor = ColorRef.fromBits(reader.readUInt32())
    const shadowColor = ColorRef.fromBits(reader.readUInt32())

    const charShape = new CharShapeStyle(
      fontIds,
      fontScales,
      fontSpacings,
      fontSizes,
      fontPositions,
      baseSize,
      italic,
      bold,
      underlineKind,
      underlineShape,
      outlineKind,
      shadowKind,
      emboss,
      engrave,
      supscript,
      subscript,
      strike,
      symMark,
      useFontSpace,
      strikeShape,
      useKerning,
      shadowOffsetX,
      shadowOffsetY,
      color,
      underlineColor,
      shadeColor,
      shadowColor,
    )

    if (version.gte(new HWPVersion(5, 0, 2, 1))) {
      charShape.borderFillId = reader.readUInt16()
    }

    if (version.gte(new HWPVersion(5, 0, 3, 0))) {
      charShape.strikeColor = ColorRef.fromBits(reader.readUInt32())
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: CharShape: Reader is not EOF')
    }

    return charShape
  }
}

export enum UnderlineKind {
  None,
  Bottom,
  Top,
}

function mapUnderlineKind(value: number) {
  if (value >= UnderlineKind.None && value <= UnderlineKind.Top) {
    return value as UnderlineKind
  }
  throw new Error(`Unknown UnderlineKind: ${value}`)
}

export enum OutlineKind {
  /** 없음 */
  None,
  /** 실선 */
  Solid,
  /** 점선 */
  Dot,
  /** 굵은 실선(두꺼운 선) */
  Tick,
  /** 파선(긴 점선) */
  Dash,
  /** 일점쇄선 (-.-.-.-.) */
  DashDot,
  /** 이점쇄선 (-..-..-..) */
  DashDotDot,
}

function mapOutlineKind(value: number) {
  if (value >= OutlineKind.None && value <= OutlineKind.DashDotDot) {
    return value as OutlineKind
  }
  throw new Error(`Unknown OutlineKind: ${value}`)
}

export enum CharShadowKind {
  /** 없음 */
  None,
  /** 비연속 */
  Drop,
  /** 연속 */
  Continuous,
}

function mapShadowKind(value: number) {
  if (value >= CharShadowKind.None && value <= CharShadowKind.Continuous) {
    return value as CharShadowKind
  }
  throw new Error(`Unknown CharShadowKind: ${value}`)
}

export enum SymMark {
  /** 없음 */
  None,
  /** 검정 동그라미 강조점 */
  DotAbove,
  /** 속 빈 동그라미 강조점̊̊̊̊̊̊̊̊̊ */
  RingAbove,
  /** ˇ */
  Caron,
  /**  ̃ */
  Tilde,
  /** ･ */
  DotMiddle,
  /** : */
  Colon,
}

function mapSymMark(value: number) {
  if (value >= SymMark.None && value <= SymMark.Colon) {
    return value as SymMark
  }
  throw new Error(`Unknown SymMark: ${value}`)
}
