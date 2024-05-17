import { SectionTagID } from '../../constants/tag-id.js'
import type { ParseOptions } from '../../types/parser.js'
import { ByteReader } from '../../utils/byte-reader.js'
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import type { HWPVersion } from '../version.js'
import { ParagraphList } from './paragraph-list.js'

/** 글상자 */
export class DrawText {
  constructor(
    /** 문단 리스트 */
    public paragraphs: ParagraphList,
    /** 글상자 텍스트 왼쪽 여백 */
    public marginLeft: number,
    /** 글상자 텍스트 오른쪽 여백 */
    public marginRight: number,
    /** 글상자 텍스트 위쪽 여백 */
    public marginTop: number,
    /** 글상자 텍스트 아래쪽 여백 */
    public marginBottom: number,
    /** 텍스트 문자열의 최대 폭 */
    public lastWidth: number,
    /** 스펙에 정의되지 않은 바이트 */
    public unknown: ArrayBuffer,
  ) {}

  static fromRecords(
    records: PeekableIterator<HWPRecord>,
    version: HWPVersion,
    options: ParseOptions,
  ) {
    const record = records.next()
    if (record.id !== SectionTagID.HWPTAG_LIST_HEADER) {
      throw new Error('BodyText: DrawText: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const paragraphs = ParagraphList.fromReader(reader, records, version, options)

    const marginLeft = reader.readUInt16()
    const marginRight = reader.readUInt16()
    const marginTop = reader.readUInt16()
    const marginBottom = reader.readUInt16()

    const lastWidth = reader.readUInt32()

    const unknown = reader.read(reader.remainByte())

    return new DrawText(
      paragraphs,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      lastWidth,
      unknown,
    )
  }
}
