import { CommonCtrlID } from '../../constants/ctrl-id.js'
import { SectionTagID } from '../../constants/tag-id.js'
import { getBitValue, getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import { ColorRef } from '../color-ref.js'
import {
  type BorderKind,
  type Fill,
  mapBorderKind,
  mapFill,
} from '../doc-info/border-fill.js'
import type { HWPRecord } from '../record.js'

type TransformationMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
]

export class ElementProperties {
  constructor(
    /** 컨트롤 ID */
    public ctrlId: number,
    /** 개체가 속한 그룹 내에서의 X offset */
    public offsetX: number,
    /** 개체가 속한 그룹 내에서의 Y offset */
    public offsetY: number,
    /** 몇 번이나 그룹 되었는지 */
    public groupLevel: number,
    /** 개체 요소의 local file version */
    public localFileVersion: number,
    /** 개체 생성 시 초기 폭 */
    public originalWidth: number,
    /** 개체 생성 시 초기 높이 */
    public originalHeight: number,
    /** 개체의 현재 폭 */
    public currentWidth: number,
    /** 개체의 현재 높이 */
    public currentHeight: number,
    /** 좌우로 뒤집여진 상태인지 여부 */
    public horizontalFlip: boolean,
    /** 상하로 뒤집여진 상태인지 여부 */
    public verticalFlip: boolean,
    /** 회전각 */
    public angle: number,
    /** 회전 중심의 x 좌표(개체 좌표계) */
    public centerX: number,
    /** 회전 중심의 y 좌표(개체 좌표계) */
    public centerY: number,
    /** 이동 행렬 */
    public translationMatrix: TransformationMatrix,
    /** 크기 변환행렬 모음 */
    public scaleMatrices: TransformationMatrix[],
    /** 회전 변환행렬 모음 */
    public rotationMatrices: TransformationMatrix[],
    /** 자식 ID (컨테이너에서만 사용) */
    public childrenIds: number[] | null,
    /** HWPX의 inst_id 속성과 같은 값 (컨테이너에서만 사용) */
    public instanceId: number | null,
    /** 테두리선 정보 */
    public outline: Outline | null,
    /** 채우기 정보 */
    public fill: Fill | null,
    /** 그림자 정보 */
    public shadow: Shadow | null,
  ) {}

  static fromRecords(records: PeekableIterator<HWPRecord>, fromGso: boolean) {
    const record = records.next()
    if (record.id !== SectionTagID.HWPTAG_SHAPE_COMPONENT) {
      throw new Error('BodyText: ElementProperties: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const ctrlId = reader.readUInt32()
    if (fromGso) {
      if (ctrlId !== reader.readUInt32()) {
        throw new Error('BodyText: ElementProperties: Control ID mismatch')
      }
    }

    const offsetX = reader.readInt32()
    const offsetY = reader.readInt32()
    const groupLevel = reader.readUInt16()
    const localFileVersion = reader.readUInt16()
    const originalWidth = reader.readUInt32()
    const originalHeight = reader.readUInt32()
    const currentWidth = reader.readUInt32()
    const currentHeight = reader.readUInt32()

    const attribute = reader.readUInt32()
    const horizontalFlip = getFlag(attribute, 0)
    const verticalFlip = getFlag(attribute, 1)

    const angle = reader.readInt16()
    const centerX = reader.readInt32()
    const centerY = reader.readInt32()

    const count = reader.readUInt16()
    const translationMatrix = readTransformationMatrix(reader)

    const scaleMatrices: TransformationMatrix[] = []
    const rotationMatrices: TransformationMatrix[] = []
    for (let i = 0; i < count; i++) {
      scaleMatrices.push(readTransformationMatrix(reader))
      rotationMatrices.push(readTransformationMatrix(reader))
    }

    // 컨테이너 컨트롤 추가 정보
    let childrenIds: number[] | null = null
    let instanceId: number | null = null

    if (ctrlId === CommonCtrlID.Container && !reader.isEOF()) {
      const count = reader.readUInt16()
      const ids: number[] = []
      for (let i = 0; i < count; i++) {
        ids.push(reader.readUInt32())
      }
      childrenIds = ids
      instanceId = reader.readUInt32()
    }

    const outline = !reader.isEOF() ? Outline.fromReader(reader, ctrlId) : null
    const fill = !reader.isEOF() ? mapFill(reader) : null
    const shadow = !reader.isEOF() ? Shadow.fromReader(reader) : null

    if (!reader.isEOF()) {
      throw new Error('BodyText: ElementProperties: Reader is not EOF')
    }

    return new ElementProperties(
      ctrlId,
      offsetX,
      offsetY,
      groupLevel,
      localFileVersion,
      originalWidth,
      originalHeight,
      currentWidth,
      currentHeight,
      horizontalFlip,
      verticalFlip,
      angle,
      centerX,
      centerY,
      translationMatrix,
      scaleMatrices,
      rotationMatrices,
      childrenIds,
      instanceId,
      outline,
      fill,
      shadow,
    )
  }
}

/** 테두리선 정보 */
export class Outline {
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
    /** 스타일 */
    public style: OutlineStyle,
  ) {}

  static fromReader(reader: ByteReader, ctrlId: number) {
    const color = ColorRef.fromBits(reader.readUInt32())

    // NOTE: (@hahnlee) 문서와 사이즈가 다름
    const width = reader.readUInt32()

    const attribute = reader.readUInt32()
    const kind = mapBorderKind(getBitValue(attribute, 0, 5))
    const defaultCap =
      ctrlId === CommonCtrlID.Picture ? EndCap.Round : EndCap.Flat
    const endCap = mapEndCap(getBitValue(attribute, 6, 9)) || defaultCap
    const headStyle = mapArrowStyle(getBitValue(attribute, 10, 15))
    const tailStyle = mapArrowStyle(getBitValue(attribute, 16, 21))
    const headSize = mapArrowSize(getBitValue(attribute, 22, 25))
    const tailSize = mapArrowSize(getBitValue(attribute, 26, 29))
    const headFill = getFlag(attribute, 30)
    const tailFill = getFlag(attribute, 31)

    const style = mapOutlineStyle(reader.readUInt8())

    return new Outline(
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
      style,
    )
  }
}

export enum EndCap {
  Round,
  Flat,
}

export function mapEndCap(value: number) {
  if (value >= EndCap.Round && value <= EndCap.Flat) {
    return value as EndCap
  }
  throw new Error(`Unknown EndCap: ${value}`)
}

export enum OutlineStyle {
  Normal,
  Outer,
  Inner,
}

function mapOutlineStyle(value: number) {
  if (value >= OutlineStyle.Normal && value <= OutlineStyle.Inner) {
    return value as OutlineStyle
  }
  throw new Error(`Unknown OutlineStyle: ${value}`)
}

/**
 * 화살표 모양
 * NOTE: 창모양은 문서에 누락되어있음. (HWPX참고)
 */
export enum ArrowStyle {
  /** 모양 없음 */
  None,
  /** 화살 모양 */
  Arrow,
  /** 창 모양 */
  Spear,
  /** 오목한 화살모양 */
  ConcaveArrow,
  /** 속이 빈 다이아몬드 모양 */
  EmptyDiamond,
  /** 속이 빈 원 모양 */
  EmptyCircle,
  /** 속이 빈 사각 모양 */
  EmptyBox,
  /** 속이 채워진 다이아몬드 모양 */
  FilledDiamond,
  /** 속이 채워진 원 모양 */
  FilledCircle,
  /** 속이 채워진 사각 모양 */
  FieldBox,
}

export function mapArrowStyle(value: number) {
  if (value >= ArrowStyle.None && value <= ArrowStyle.FieldBox) {
    return value as ArrowStyle
  }
  throw new Error(`Unknown ArrowStyle: ${value}`)
}

/** 화살표 사이즈 */
export enum ArrowSize {
  /** 작은-작은 */
  SmallSmall,
  /** 작은-중간 */
  SmallMedium,
  /** 작은-큰 */
  SmallLarge,
  /** 중간-작은 */
  MediumSmall,
  /** 중간-중간 */
  MediumMedium,
  /** 중간-큰 */
  MediumLarge,
  /** 큰-작은 */
  LargeSmall,
  /** 큰-중간 */
  LargeMedium,
  /** 큰-큰 */
  LargeLarge,
}

export function mapArrowSize(value: number) {
  if (value >= ArrowSize.SmallSmall && value <= ArrowSize.LargeLarge) {
    return value as ArrowSize
  }
  throw new Error(`Unknown ArrowSize: ${value}`)
}

export class Shadow {
  constructor(
    /** 그림자 종류 */
    public kind: ShadowKind,
    /** 그림자 색상 */
    public color: ColorRef,
    /** 그림자 간격 X */
    public offsetX: number,
    /** 그림자 간격 Y */
    public offsetY: number,
    /** 그림자 간격 투명도 */
    public alpha: number,
    /** 알 수 없는 바이트 */
    public unknown: ArrayBuffer,
  ) {}

  static fromReader(reader: ByteReader) {
    const kind = mapShadowKind(reader.readUInt32())
    const color = ColorRef.fromBits(reader.readUInt32())
    const offsetX = reader.readInt32()
    const offsetY = reader.readInt32()
    const unknown = reader.read(5)
    const alpha = reader.readUInt8()

    return new Shadow(kind, color, offsetX, offsetY, alpha, unknown)
  }
}

export enum ShadowKind {
  /** 없음 */
  None,
  /** 왼쪽 위 */
  LeftTop,
  /** 오른쪽 위 */
  RightTop,
  /** 왼쪽 아래 */
  LeftBottom,
  /** 오른쪽 아래 */
  RightBottom,
  /** 왼쪽 뒤 */
  LeftBack,
  /** 오른쪽 뒤 */
  RightBack,
  /** 왼쪽 앞 */
  LeftFront,
  /** 오른쪽 앞 */
  RightFront,
  /** 작게 */
  Small,
  /** 크게 */
  Large,
}

function mapShadowKind(value: number) {
  if (value >= ShadowKind.None && value <= ShadowKind.Large) {
    return value as ShadowKind
  }
  throw new Error(`Unknown ShadowKind: ${value}`)
}

function readTransformationMatrix(reader: ByteReader): TransformationMatrix {
  return [
    [reader.readFloat64(), reader.readFloat64(), reader.readFloat64()],
    [reader.readFloat64(), reader.readFloat64(), reader.readFloat64()],
    [0.0, 0.0, 1.0],
  ]
}
