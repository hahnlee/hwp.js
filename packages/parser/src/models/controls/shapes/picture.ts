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
import { getBitValue, getFlag } from '../../../utils/bit-utils.js'
import { ByteReader } from '../../../utils/byte-reader.js'
import type { PeekableIterator } from '../../../utils/generator.js'
import { ColorRef } from '../../color-ref.js'
import { BorderKind, mapBorderKind } from '../../doc-info/border-fill.js'
import { Image } from '../../doc-info/bullet.js'
import type { HWPRecord } from '../../record.js'
import type { HWPVersion } from '../../version.js'
import { CommonProperties } from '../common-properties.js'
import {
  type ArrowSize,
  type ArrowStyle,
  ElementProperties,
  type EndCap,
  mapArrowSize,
  mapArrowStyle,
  mapEndCap,
} from '../element-properties.js'

/** 그림 */
export class PictureControl {
  constructor(
    /** 개체 공통 속성 */
    public commonProperties: CommonProperties,
    /** 개체 요소 속성 */
    public elementProperties: ElementProperties,
    /** 내용 */
    public content: PictureRecord,
  ) {}

  static fromRecord(
    record: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
  ) {
    const commonProperties = CommonProperties.fromRecord(
      record,
      iterator,
      version,
    )
    const elementProperties = ElementProperties.fromRecords(iterator, false)
    const content = PictureRecord.fromRecords(iterator)

    return new PictureControl(commonProperties, elementProperties, content)
  }
}

export class PictureRecord {
  constructor(
    /** 테두리 */
    public outline: PictureOutline,
    /** 도형의 영역 */
    public rect: Rect,
    /** 자르기 한 후 사각형의 left */
    public left: number,
    /** 자르기 한 후 사각형의 top */
    public top: number,
    /** 자르기 한 후 사각형의 right */
    public right: number,
    /** 자르기 한 후 사각형의 bottom */
    public bottom: number,
    /** 왼쪽 여백 */
    public marginLeft: number,
    // 오른쪽 여백
    public marginRight: number,
    /** 위쪽 여백 */
    public marginTop: number,
    /** 아래쪽 여백 */
    public marginBottom: number,
    /** 이미지 정보 */
    public image: Image,
    /** 문서 내 각 개체에 대한 고유 아이디(instance ID) */
    public instanceId: number | null,
    /** 그림 효과 */
    public effect: PictureEffect | null,
    /** 그림 추가정보 */
    public additionalProperties: PictureAdditionalProperties | null,
  ) {}

  static fromRecords(records: PeekableIterator<HWPRecord>) {
    const record = records.next()
    if (record.id !== SectionTagID.HWPTAG_SHAPE_COMPONENT_PICTURE) {
      throw new Error('BodyText: PictureRecord: Record has wrong tag ID')
    }

    const reader = new ByteReader(record.data)
    const outline = PictureOutline.fromReader(reader)

    // NOTE: (@hahnlee) 문서에 정의된 순서와 다름
    const rect = Rect.fromReader(reader)

    const left = reader.readInt32()
    const top = reader.readInt32()
    const right = reader.readInt32()
    const bottom = reader.readInt32()

    const marginLeft = reader.readInt16()
    const marginRight = reader.readInt16()
    const marginTop = reader.readInt16()
    const marginBottom = reader.readInt16()

    const image = Image.fromReader(reader)
    outline.alpha = reader.readUInt8()

    const instanceId = reader.isEOF() ? null : reader.readUInt32()
    const effect = reader.isEOF() ? null : PictureEffect.fromReader(reader)
    const additionalProperties = reader.isEOF()
      ? null
      : PictureAdditionalProperties.fromReader(reader)

    if (!reader.isEOF()) {
      throw new Error('BodyText: PictureRecord: There are remaining bytes')
    }

    return new PictureRecord(
      outline,
      rect,
      left,
      top,
      right,
      bottom,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      image,
      instanceId,
      effect,
      additionalProperties,
    )
  }
}

export class PictureOutline {
  constructor(
    /** 선 색상 */
    public color: ColorRef,
    /** 선 굵기 */
    public width: number,
    /** 선 종류 */
    public kind: BorderKind,
    /** 선 끝 모양 */
    public endCap: EndCap,
    /** 화살표 시작 모양 */
    public headStyle: ArrowStyle,
    /** 화살표 끝 모양 */
    public tailStyle: ArrowStyle,
    /** 화살표 시작 크기 */
    public headSize: ArrowSize,
    /** 화살표 끝 크기 */
    public tailSize: ArrowSize,
    /** 시작부분 화살표 채움 여부 */
    public headFill: boolean,
    /** 끝부분 화살표 채움 여부 */
    public tailFill: boolean,
    /** 투명도 */
    public alpha: number,
  ) {}

  static fromReader(reader: ByteReader) {
    const color = ColorRef.fromBits(reader.readUInt32())

    // NOTE: (@hahnlee) 문서와 사이즈가 다름
    const width = reader.readUInt32()

    const attribute = reader.readUInt32()
    const kind = mapBorderKind(getBitValue(attribute, 0, 5))
    const endCap = mapEndCap(getBitValue(attribute, 6, 9))
    const headStyle = mapArrowStyle(getBitValue(attribute, 10, 15))
    const tailStyle = mapArrowStyle(getBitValue(attribute, 16, 21))
    const headSize = mapArrowSize(getBitValue(attribute, 22, 25))
    const tailSize = mapArrowSize(getBitValue(attribute, 26, 29))
    const headFill = getFlag(attribute, 30)
    const tailFill = getFlag(attribute, 31)

    return new PictureOutline(
      color,
      width,
      kind,
      endCap,
      headStyle,
      tailStyle,
      headSize,
      tailSize,
      headFill,
      tailFill,
      0,
    )
  }
}

export class Rect {
  constructor(
    public leftTop: Point,
    public rightTop: Point,
    public rightBottom: Point,
    public leftBottom: Point,
  ) {}

  static fromReader(reader: ByteReader) {
    return new Rect(
      Point.fromReader(reader),
      Point.fromReader(reader),
      Point.fromReader(reader),
      Point.fromReader(reader),
    )
  }
}

export class Point {
  constructor(public x: number, public y: number) {}

  static fromReader(reader: ByteReader) {
    return new Point(reader.readInt32(), reader.readInt32())
  }
}

export class PictureEffect {
  constructor(
    /** 그림자 */
    public shadow: PictureShadow | null,
    /** 네온 */
    public glow: Glow | null,
    /** 부드러운 가장자리 */
    public softEdge: SoftEdge | null,
    /** 반사 */
    public reflection: Reflection | null,
  ) {}

  static fromReader(reader: ByteReader) {
    const attribute = reader.readUInt32()

    const shadow = getFlag(attribute, 0)
      ? PictureShadow.fromReader(reader)
      : null

    const glow = getFlag(attribute, 1) ? Glow.fromReader(reader) : null
    const softEdge = getFlag(attribute, 2) ? SoftEdge.fromReader(reader) : null

    const reflection = getFlag(attribute, 3)
      ? Reflection.fromReader(reader)
      : null

    return new PictureEffect(shadow, glow, softEdge, reflection)
  }
}

export class PictureShadow {
  constructor(
    /** 그림자 스타일 */
    public style: ShadowStyle,
    /** 그림자 투명도 */
    public alpha: number,
    /** 그림자 흐릿하게 */
    public radius: number,
    /** 방향 */
    public direction: number,
    /** 거리 */
    public distance: number,
    /** 정렬 */
    public align: AlignStyle,
    /** 기울기 각도(X) */
    public skewX: number,
    /** 기울기 각도(Y) */
    public skewY: number,
    /** 확대 비율(X) */
    public scaleX: number,
    /** 확대 비율(Y) */
    public scaleY: number,
    /** 도형과 함께 그림자 회전 */
    public rotation: boolean,
    /** 색상 */
    public color: EffectColor,
  ) {}

  static fromReader(reader: ByteReader) {
    return new PictureShadow(
      mapShadowStyle(reader.readInt32()),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      mapAlignStyle(reader.readInt32()),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readInt32() > 0,
      EffectColor.fromReader(reader),
    )
  }
}

export enum ShadowStyle {
  Outside,
  Inside,
}

function mapShadowStyle(value: number) {
  if (value >= ShadowStyle.Outside && value <= ShadowStyle.Inside) {
    return value
  }
  throw new Error(`Invalid ShadowStyle value: ${value}`)
}

export enum AlignStyle {
  TopLeft,
  Top,
  TopRight,
  Left,
  Center,
  Right,
  BottomLeft,
  Bottom,
  BottomRight,
}

function mapAlignStyle(value: number) {
  if (value >= AlignStyle.TopLeft && value <= AlignStyle.BottomRight) {
    return value
  }
  throw new Error(`Invalid AlignStyle value: ${value}`)
}

export class EffectColor {
  constructor(
    /** 색상타입 */
    public kind: EffectColorKind,
    /** 값 */
    public value: EffectColorValue,
    /** 색상효과 */
    public colorEffects: EffectColorEffect[],
  ) {}

  static fromReader(reader: ByteReader) {
    const kind = mapEffectColorKind(reader.readUInt32())
    const value = readEffectColorValue(reader, kind)
    const count = reader.readUInt32()
    const colorEffects: EffectColorEffect[] = []
    for (let i = 0; i < count; i++) {
      colorEffects.push(EffectColorEffect.fromReader(reader))
    }

    return new EffectColor(kind, value, colorEffects)
  }
}

export enum EffectColorKind {
  RGB,
  CMYK,
  Scheme,
  System,
}

function mapEffectColorKind(value: number) {
  if (value >= EffectColorKind.RGB && value <= EffectColorKind.System) {
    return value
  }
  throw new Error(`Invalid EffectColorKind value: ${value}`)
}

export type EffectColorValue =
  | {
      kind: EffectColorKind.RGB
      value: number
    }
  | {
      kind: EffectColorKind.CMYK
      value: number
    }
  | {
      kind: EffectColorKind.Scheme
      value: [number, number, number]
    }
  | {
      kind: EffectColorKind.System
      value: [number, number, number]
    }

function readEffectColorValue(
  reader: ByteReader,
  kind: EffectColorKind,
): EffectColorValue {
  switch (kind) {
    case EffectColorKind.RGB:
      return {
        kind,
        value: reader.readUInt32(),
      }
    case EffectColorKind.CMYK:
      return {
        kind,
        value: reader.readUInt32(),
      }
    case EffectColorKind.Scheme:
      return {
        kind,
        value: [
          reader.readFloat32(),
          reader.readFloat32(),
          reader.readFloat32(),
        ],
      }
    case EffectColorKind.System:
      return {
        kind,
        value: [
          reader.readFloat32(),
          reader.readFloat32(),
          reader.readFloat32(),
        ],
      }
  }
}

export enum EffectColorEffectKind {
  Alpha,
  AlphaMod,
  AlphaOff,
  Red,
  RedMod,
  RedOff,
  Green,
  GreenMod,
  GreenOff,
  Blue,
  BlueMod,
  BlueOff,
  Hue,
  HueMod,
  HueOff,
  Sat,
  SatMod,
  SatOff,
  Lum,
  LumMod,
  LumOff,
  Shade,
  Tint,
  Gray,
  Comp,
  Gamma,
  InvGamma,
  Inv,
}

function mapEffectColorEffectKind(value: number) {
  if (
    value >= EffectColorEffectKind.Alpha &&
    value <= EffectColorEffectKind.Inv
  ) {
    return value
  }
  throw new Error(`Invalid EffectColorEffectKind value: ${value}`)
}

export class EffectColorEffect {
  constructor(
    /** 색상 효과 종류 */
    public kind: EffectColorEffectKind,
    /** 색상 효과 값 */
    public value: number,
  ) {}

  static fromReader(reader: ByteReader) {
    return new EffectColorEffect(
      mapEffectColorEffectKind(reader.readUInt32()),
      reader.readFloat32(),
    )
  }
}

export class Glow {
  constructor(
    /** 네온 투명도 */
    public alpha: number,
    /** 네온 반경 */
    public radius: number,
    /** 색상 */
    public color: EffectColor,
  ) {}

  static fromReader(reader: ByteReader) {
    return new Glow(
      reader.readFloat32(),
      reader.readFloat32(),
      EffectColor.fromReader(reader),
    )
  }
}

export class SoftEdge {
  constructor(
    /** 부드러운 가장자리 반경 */
    public radius: number,
  ) {}

  static fromReader(reader: ByteReader) {
    return new SoftEdge(reader.readFloat32())
  }
}

export class Reflection {
  constructor(
    /** 반사 스타일 */
    public align: AlignStyle,
    /** 반경 */
    public radius: number,
    /** 방향 */
    public direction: number,
    /** 거리 */
    public distance: number,
    /** 기울기 각도(X) */
    public skewX: number,
    /** 기울기 각도(Y) */
    public skewY: number,
    /** 확대 비율(X) */
    public scaleX: number,
    /** 확대 비율(Y) */
    public scaleY: number,
    /** 도형과 함께 그림자 회전 */
    public rotated: boolean,
    /** 시작 투명도 */
    public startAlpha: number,
    /** 시작 위치 */
    public startPosition: number,
    /** 끝 투명도 */
    public endAlpha: number,
    /** 끝 위치 */
    public endPosition: number,
    /** 오프셋 방향 */
    public offsetDirection: number,
  ) {}

  static fromReader(reader: ByteReader) {
    return new Reflection(
      mapAlignStyle(reader.readInt32()),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readInt32() > 0,
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
    )
  }
}

export class PictureAdditionalProperties {
  constructor(
    /** 그림 최초 생성 시 기준 이미지 너비 */
    public width: number,
    /** 그림 최초 생성 시 기준 이미지 높이 */
    public height: number,
    /** 이미지 투명도 */
    public alpha: number,
  ) {}

  static fromReader(reader: ByteReader) {
    const width = reader.readUInt32()
    const height = reader.readUInt32()
    const alpha = reader.isEOF() ? 0 : reader.readUInt8()

    return new PictureAdditionalProperties(
      width,
      height,
      alpha,
    )
  }
}
