import { DocInfoTagID } from '../../constants/tag-id.js'
import { getBitValue, getFlag } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'

export class Numbering {
  constructor(
    /** 시작 번호 */
    public start: number,
    /** 문단 모양들 */
    public paragraphHeads: ParagraphHead[],
  ) {}

  static fromRecord(record: HWPRecord, version: HWPVersion) {
    if (record.id !== DocInfoTagID.HWPTAG_NUMBERING) {
      throw new Error('DocInfo:Numbering: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const paragraphHeads: ParagraphHead[] = []
    for (let i = 0; i < 7; i++) {
      paragraphHeads.push(ParagraphHead.fromReader(reader, true))
    }

    const start = reader.readUInt16()
    if (version.gte(new HWPVersion(5, 0, 2, 5))) {
      for (let i = 0; i < 7; i++) {
        paragraphHeads[i].startNumber = reader.readUInt32()
      }
    }

    if (!reader.isEOF()) {
      for (let i = 7; i < 10; i++) {
        paragraphHeads.push(ParagraphHead.fromReader(reader, true))
      }

      if (version.gte(new HWPVersion(5, 1, 0, 0))) {
        for (let i = 7; i < 10; i++) {
          paragraphHeads[i].startNumber = reader.readUInt32()
        }
      }
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: Numbering: Reader is not EOF')
    }

    return new Numbering(start, paragraphHeads)
  }
}

export class ParagraphHead {
  constructor(
    /** 문단의 정렬 종류 */
    public align: ParagraphHeadAlign,
    /** 번호 너비를 실제 인스턴스 문자열의 너비에 따를지 여부 */
    public useInstanceWidth: boolean,
    /** 자동 내어 쓰기 여부 */
    public autoIndent: boolean,
    /** 수준별 본문과의 거리 종류 */
    public textOffsetKind: TextOffsetKind,
    /** 너비 보정값 */
    public widthAdjust: number,
    /** 본문과의 거리 */
    public textOffset: number,
    /** 글자 모양 아이디 참조 */
    public charShapeId: number,
    /** 번호 형식 */
    public numberFormat: string,
  ) {}

  /**
   * 수준별 시작번호
   * - level 1~7: 5.0.2.5 이상
   * - level 8~10: 5.1.0.0 이상
   */
  public startNumber?: number

  static fromReader(reader: ByteReader, numbering: boolean) {
    // 속성(표 40 참조)
    const attribute = reader.readUInt32()
    const align = mapParagraphHeadAlign(getBitValue(attribute, 0, 1))
    const useInstanceWidth = getFlag(attribute, 2)
    const autoIndent = getFlag(attribute, 3)
    const textOffsetKind = mapTextOffsetKind(getBitValue(attribute, 4))

    const widthAdjust = reader.readInt16()
    const textOffset = reader.readInt16()
    const charShapeId = reader.readUInt32()
    const numberFormat = numbering ? reader.readString() : ''

    const head = new ParagraphHead(
      align,
      useInstanceWidth,
      autoIndent,
      textOffsetKind,
      widthAdjust,
      textOffset,
      charShapeId,
      numberFormat,
    )

    return head
  }
}

export enum ParagraphHeadAlign {
  Left,
  Center,
  Right,
}

function mapParagraphHeadAlign(value: number) {
  if (value >= ParagraphHeadAlign.Left && value <= ParagraphHeadAlign.Right) {
    return value as ParagraphHeadAlign
  }
  throw new Error(`Unknown ParagraphHeadAlign: ${value}`)
}

export enum TextOffsetKind {
  /** 글자 크기에 대한 상대 비율 */
  Percent,
  /** 값 */
  HWPUnit,
}

function mapTextOffsetKind(value: number) {
  if (value >= TextOffsetKind.Percent && value <= TextOffsetKind.HWPUnit) {
    return value as TextOffsetKind
  }
  throw new Error(`Unknown TextOffsetKind: ${value}`)
}
