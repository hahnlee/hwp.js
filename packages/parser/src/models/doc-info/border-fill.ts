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
import { ColorRef } from '../color-ref.js'
import { HWPRecord } from '../record.js'
import { Image } from './bullet.js'

export class BorderFill {
  constructor(
    /** 3D 효과의 유무 */
    public effect3d: boolean,
    /** 그림자 효과의 유무 */
    public effectShadow: boolean,
    /** Slash 대각선 모양 */
    public slashDiagonalShape: SlashDiagonalShape,
    /** BackSlash 대각선 모양 */
    public backSlashDiagonalShape: number,
    /** Slash 대각선 꺾은선 여부 */
    public brokenSlashDiagonalLine: boolean,
    /** BackSlash 대각선 꺾은선 여부 */
    public brokenBackSlashDiagonalLine: boolean,
    /** Slash 대각선 모양 180도 회전 여부 */
    public slackDiagonalLineRotated: boolean,
    /** BackSlash 대각선 모양 180도 회전 여부 */
    public backSlackDiagonalLineRotated: boolean,
    /** 중심선 유무 */
    public centerLine: boolean,
    /** 선 정보 */
    public borders: [Border, Border, Border, Border],
    /** 대각선 */
    public diagonalBorder: Border,
    /** 채우기 정보 */
    public fill: Fill,
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_BORDER_FILL) {
      throw new Error('DocInfo: Border: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const attributes = reader.readUInt16()

    const effect3d = getFlag(attributes, 0)
    const effectShadow = getFlag(attributes, 1)
    const slashDiagonalShape = mapSlashDiagonalShape(
      getBitValue(attributes, 2, 4),
    )
    const backSlashDiagonalShape = mapBackSlashDiagonalShape(
      getBitValue(attributes, 5, 7),
    )
    const brokenSlashDiagonalLine = getBitValue(attributes, 8, 9) > 0
    const brokenBackSlashDiagonalLine = getFlag(attributes, 10)
    const slackDiagonalLineRotated = getFlag(attributes, 11)
    const backSlackDiagonalLineRotated = getFlag(attributes, 12)
    const centerLine = getFlag(attributes, 13)
    const borders: [Border, Border, Border, Border] = [
      Border.fromReader(reader),
      Border.fromReader(reader),
      Border.fromReader(reader),
      Border.fromReader(reader),
    ]
    const diagonalBorder = Border.fromReader(reader)
    const fill = mapFill(reader)

    if (!reader.isEOF()) {
      throw new Error('DocInfo: Border: Reader is not EOF')
    }

    return new BorderFill(
      effect3d,
      effectShadow,
      slashDiagonalShape,
      backSlashDiagonalShape,
      brokenSlashDiagonalLine,
      brokenBackSlashDiagonalLine,
      slackDiagonalLineRotated,
      backSlackDiagonalLineRotated,
      centerLine,
      borders,
      diagonalBorder,
      fill,
    )
  }
}

export enum SlashDiagonalShape {
  None = 0b000,
  Slash = 0b010,
  LeftTopToBottomEdge = 0b011,
  LeftTopToRightEdge = 0b110,
  LeftTopToBottomRightEdge = 0b111,
}

function mapSlashDiagonalShape(value: number) {
  switch (value) {
    case SlashDiagonalShape.None:
      return SlashDiagonalShape.None
    case SlashDiagonalShape.Slash:
      return SlashDiagonalShape.Slash
    case SlashDiagonalShape.LeftTopToBottomEdge:
      return SlashDiagonalShape.LeftTopToBottomEdge
    case SlashDiagonalShape.LeftTopToRightEdge:
      return SlashDiagonalShape.LeftTopToRightEdge
    case SlashDiagonalShape.LeftTopToBottomRightEdge:
      return SlashDiagonalShape.LeftTopToBottomRightEdge
    default:
      throw new Error(`Unknown slash diagonal shape: ${value}`)
  }
}

export enum BackSlashDiagonalShape {
  None = 0b000,
  BackSlash = 0b010,
  RightTopToBottomEdge = 0b011,
  RightTopToLeftEdge = 0b110,
  RightTopToBottomLeftEdge = 0b111,
}

function mapBackSlashDiagonalShape(value: number) {
  switch (value) {
    case BackSlashDiagonalShape.None:
      return BackSlashDiagonalShape.None
    case BackSlashDiagonalShape.BackSlash:
      return BackSlashDiagonalShape.BackSlash
    case BackSlashDiagonalShape.RightTopToBottomEdge:
      return BackSlashDiagonalShape.RightTopToBottomEdge
    case BackSlashDiagonalShape.RightTopToLeftEdge:
      return BackSlashDiagonalShape.RightTopToLeftEdge
    case BackSlashDiagonalShape.RightTopToBottomLeftEdge:
      return BackSlashDiagonalShape.RightTopToBottomLeftEdge
  }
  throw new Error(`Unknown back slash diagonal shape: ${value}`)
}

export class Border {
  constructor(
    public width: number,
    public kind: BorderKind,
    public color: ColorRef,
  ) {}

  static fromReader(reader: ByteReader) {
    const width = reader.readUInt8()
    const kind = mapBorderKind(reader.readUInt8())
    const color = ColorRef.fromBits(reader.readUInt32())

    return new Border(width, kind, color)
  }
}

export enum BorderKind {
  /** 실선 */
  Solid,
  /** 긴 점선 */
  Dash,
  /** 점선 */
  Dot,
  /** -.-.-.-. */
  DashDot,
  /** -..-..-.. */
  DashDotDot,
  /** Dash보다 긴 선분의 반복 */
  LongDash,
  /** Dot보다 큰 동그라미의 반복 */
  Circle,
  /** 2중선 */
  DoubleSlim,
  /** 가는선 + 굵은선 2중선 */
  SlimThick,
  /** 굵은선 + 가는선 2중선 */
  TickSlim,
  /** 가는선 + 굵은선 + 가는선 3중선 */
  SlimTickSlim,
  /** 물결 */
  Wave,
  /** 물결 2중선 */
  DoubleWave,
  /** 두꺼운 3D */
  Tick3D,
  /** 두꺼운 3D(광원 반대) */
  Tick3DInset,
  /** 3D 단선 */
  Slim3D,
  /** 3D 단선(광원 반대) */
  Slim3DInset,
}

export function mapBorderKind(value: number) {
  if (value >= BorderKind.Solid && value <= BorderKind.Slim3DInset) {
    return value as BorderKind
  }
  throw new Error(`Unknown border kind: ${value}`)
}

export type Fill =
  | {
      kind: FillKind.None
    }
  | {
      kind: FillKind.Color
      content: ColorFill
    }
  | {
      kind: FillKind.Image
      content: ImageFill
    }
  | {
      kind: FillKind.Gradation
      content: GradationFill
    }

export function mapFill(reader: ByteReader): Fill {
  const kind = mapFillKind(reader.readUInt32())
  switch (kind) {
    case FillKind.None:
      // NOTE: (@hahnlee) 추가정보의 길이, 항상 0이다
      if (reader.readUInt32() !== 0) {
        throw new Error('DocInfo: Fill: Additional info is not zero')
      }
      return { kind }
    case FillKind.Color:
      return { kind, content: ColorFill.fromReader(reader, false) } as const
    case FillKind.Image:
      return { kind, content: ImageFill.fromReader(reader) } as const
    case FillKind.Gradation:
      return { kind, content: GradationFill.fromReader(reader, false) }
    default:
      throw new Error(`Unknown fill kind: ${kind}`)
  }
}

export enum FillKind {
  /** 채우기 없음 */
  None = 0x00000000,
  /** 단색 채우기 */
  Color = 0x00000001,
  /** 이미지 채우기 */
  Image = 0x00000002,
  /** 그라데이션 채우기 */
  Gradation = 0x00000004,
}

function mapFillKind(value: number) {
  if (value >= FillKind.None && value <= FillKind.Gradation) {
    return value as FillKind
  }
  throw new Error(`Unknown fill kind: ${value}`)
}

export class ColorFill {
  constructor(
    /** 배경색 */
    public background_color: ColorRef,
    /** 무늬색 */
    public patternColor: ColorRef,
    /** 무늬종류 */
    public patternKind: PatternKind,
    /** 투명도 */
    public alpha: number,
  ) {}

  static fromReader(reader: ByteReader, checkEof: boolean = true) {
    const backgroundColor = ColorRef.fromBits(reader.readUInt32())
    const patternColor = ColorRef.fromBits(reader.readUInt32())
    const patternKind = mapPatternKind(reader.readInt32() + 1)
    const alpha = reader.readUInt8()

    // NOTE: (@hahnlee) 추가정보의 길이, 여기서는 무시한다
    if (reader.readUInt32() !== 0) {
      throw new Error('DocInfo: ColorFill: Additional info is not zero')
    }

    if (checkEof && !reader.isEOF()) {
      throw new Error('DocInfo: ColorFill: Reader is not EOF')
    }

    return new ColorFill(backgroundColor, patternColor, patternKind, alpha)
  }
}

export enum PatternKind {
  /** 없음 */
  None,
  /** - - - - */
  Horizontal,
  /** ||||| */
  Vertical,
  /** \\\\\ */
  BackSlash,
  /** \\\\\ */
  Slash,
  /** +++++ */
  Cross,
  /** xxxxx */
  CrossDiagonal,
}

function mapPatternKind(value: number) {
  if (value >= PatternKind.None && value <= PatternKind.CrossDiagonal) {
    return value as PatternKind
  }
  throw new Error(`Unknown pattern kind: ${value}`)
}

export class GradationFill {
  constructor(
    /** 그러데이션 유형 */
    public kind: GradationKind,
    /** 그러데이션의 기울임(시작 각) */
    public angle: number,
    /** 그러데이션의 가로 중심(중심 X 좌표) */
    public centerX: number,
    /** 그러데이션의 세로 중심(중심 Y 좌표) */
    public centerY: number,
    /** 그러데이션 번짐 정도 */
    public step: number,
    /** 색상이 바뀌는 곳의 위치 */
    public changePoints: number[],
    /** 색상 */
    public colors: ColorRef[],
    /** 번짐 정도의 중심 */
    public stepCenter: number,
    /** 투명도 */
    public alpha: number,
  ) {}

  static fromReader(reader: ByteReader, checkEof = true) {
    const kind = mapGradationKind(reader.readUInt8())
    const angle = reader.readUInt32()
    const centerX = reader.readUInt32()
    const centerY = reader.readUInt32()
    const step = reader.readUInt32()
    const count = reader.readUInt32()
    const changePoints: number[] = []
    if (count > 2) {
      changePoints.push(reader.readUInt32())
    }
    const colors: ColorRef[] = []
    for (let i = 0; i < count; i++) {
      colors.push(ColorRef.fromBits(reader.readUInt32()))
    }

    // NOTE: (@hahnlee) 추가정보 개수, 항상 1이다
    if (reader.readUInt32() !== 1) {
      throw new Error('DocInfo: GradationFill: Additional info is not one')
    }

    const stepCenter = reader.readUInt8()
    const alpha = reader.readUInt8()

    if (checkEof && !reader.isEOF()) {
      throw new Error('DocInfo: GradationFill: Reader is not EOF')
    }

    return new GradationFill(
      kind,
      angle,
      centerX,
      centerY,
      step,
      changePoints,
      colors,
      stepCenter,
      alpha,
    )
  }
}

export enum GradationKind {
  /** 줄무늬형 */
  Linear = 1,
  /** 원형 */
  Radial = 2,
  /** 원뿔형 */
  Conical = 3,
  /** 사각형 */
  Square = 4,
}

function mapGradationKind(value: number) {
  if (value >= GradationKind.Linear && value <= GradationKind.Square) {
    return value as GradationKind
  }
  throw new Error(`Unknown gradation kind: ${value}`)
}

export class ImageFill {
  constructor(
    /** 이미지 채우기 유형 */
    public kind: ImageFillKind,
    /** 이미지 정보 */
    public image: Image,
    /** 문서에 미정의된 값 */
    public unknown: ArrayBuffer,
  ) {}

  static fromReader(reader: ByteReader) {
    const kind = mapImageFillKind(reader.readUInt8())
    const image = Image.fromReader(reader)

    // NOTE: (@hahnlee) 추가정보 개수, 항상 0이다
    if (reader.readUInt32() !== 0) {
      throw new Error('DocInfo: ImageFill: Additional info is not zero')
    }

    const unknown = reader.read(reader.remainByte())

    return new ImageFill(kind, image, unknown)
  }
}

export enum ImageFillKind {
  /** 바둑판식으로-모두 */
  Tile,
  /** 바둑판식으로-가로/위 */
  TileHorizontalTop,
  /** 바둑판식으로-가로/아래 */
  TileHorizontalBottom,
  /** 바둑판식으로-세로/왼쪽 */
  TileVerticalLeft,
  /** 바둑판식으로-세로/오른쪽 */
  TileVerticalRight,
  /** 크기에 맞추어 */
  Total,
  /** 가운데로 */
  Center,
  /** 가운데 위로 */
  CenterTop,
  /** 가운데 아래로 */
  CenterBottom,
  /** 왼쪽 가운데로 */
  CenterLeft,
  /** 왼쪽 위로 */
  LeftTop,
  /** 왼쪽 아래로 */
  LeftBottom,
  /** 오른쪽 가운데로 */
  RightCenter,
  /** 오른쪽 위로 */
  RightTop,
  /** 오른쪽 아래로 */
  RightBottom,
  /** NONE */
  None,
}

function mapImageFillKind(value: number) {
  if (value >= ImageFillKind.Tile && value <= ImageFillKind.None) {
    return value as ImageFillKind
  }
  throw new Error(`Unknown image fill kind: ${value}`)
}