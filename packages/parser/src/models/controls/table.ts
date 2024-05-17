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
import type { PeekableIterator } from '../../utils/generator.js'
import type { HWPRecord } from '../record.js'
import { HWPVersion } from '../version.js'
import { CommonProperties } from './common-properties.js'
import { SectionTagID } from '../../constants/tag-id.js'
import { ParagraphList } from './paragraph-list.js'
import type { ParseOptions } from '../../types/parser.js'

export class TableControl {
  constructor(
    /** 개체 공통 속성 */
    public commonProperties: CommonProperties,
    public record: TableRecord,
    public cells: Cell[],
  ) {}

  static fromRecord(
    record: HWPRecord,
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
    options: ParseOptions,
  ) {
    const commonProperties = CommonProperties.fromRecord(
      record,
      iterator,
      version,
      options,
    )

    const next = iterator.next()
    if (next.id !== SectionTagID.HWPTAG_TABLE) {
      throw new Error('BodyText: Table: Record has wrong ID')
    }

    const tableRecord = TableRecord.fromRecord(next, version)
    const cells: Cell[] = []
    const cellCount = tableRecord.rowCounts.reduce(
      (result, current) => result + current,
    )

    for (let i = 0; i < cellCount; i++) {
      cells.push(Cell.fromRecords(iterator, version, options))
    }

    return new TableControl(commonProperties, tableRecord, cells)
  }
}

export class TableRecord {
  constructor(
    /** 페이지 나눔 */
    public pageBreak: PageBreak,
    /** 반복 헤더 */
    public repeatHeader: boolean,
    /** 행 개수 */
    public rows: number,
    /** 열 개수 */
    public cols: number,
    /** 셀 간격 */
    public cellSpacing: number,
    /** 셀 여백 */
    public padding: [number, number, number, number],
    /** 행 별 열 개수 */
    public rowCounts: number[],
    /** 테두리/배경 모양 ID */
    public borderFillId: number,
    /** 영역 속성 */
    public validZones: ValidZone[],
  ) {}

  static fromRecord(record: HWPRecord, version: HWPVersion) {
    if (record.id !== SectionTagID.HWPTAG_TABLE) {
      throw new Error('BodyText: Table: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const properties = reader.readUInt32()
    const pageBreak = mapPageBreak(getBitValue(properties, 0, 1))
    const repeatHeader = getFlag(properties, 2)

    const rows = reader.readUInt16()
    const cols = reader.readUInt16()

    const cellSpacing = reader.readInt16()

    const padding: [number, number, number, number] = [
      reader.readInt16(),
      reader.readInt16(),
      reader.readInt16(),
      reader.readInt16(),
    ]

    const rowCounts: number[] = []
    for (let i = 0; i < rows; i++) {
      rowCounts.push(reader.readUInt16())
    }

    const borderFillId = reader.readUInt16()

    const validZones: ValidZone[] = []
    if (version.gte(new HWPVersion(5, 0, 1, 0))) {
      const size = reader.readUInt16()
      for (let i = 0; i < size; i++) {
        validZones.push(ValidZone.fromReader(reader))
      }
    }

    if (!reader.isEOF()) {
      throw new Error('BodyText: Table: Reader is not EOF')
    }

    return new TableRecord(
      pageBreak,
      repeatHeader,
      rows,
      cols,
      cellSpacing,
      padding,
      rowCounts,
      borderFillId,
      validZones,
    )
  }
}

export enum PageBreak {
  /** 나누지 않음 */
  None,
  /** 셀 단위로 나눔 */
  Cell,
  /** 나눔 - NOTE: (@hahnlee) 문서에는 나누지 않음으로 되어있으나 나눔이 맞다 */
  Table,
}

function mapPageBreak(value: number) {
  if (value >= PageBreak.None && value <= PageBreak.Table) {
    return value as PageBreak
  }
  throw new Error(`Unknown PageBreak: ${value}`)
}

export class ValidZone {
  constructor(
    /** 시작 열 주소 */
    public startColumn: number,
    /** 시작 행 주소 */
    public startRow: number,
    /** 끝 열 주소 */
    public endColumn: number,
    /** 끝 행 주소 */
    public endRow: number,
    /** 테두리 채우기 ID */
    public borderFillId: number,
  ) {}

  static fromReader(reader: ByteReader) {
    const startColumn = reader.readUInt16()
    const startRow = reader.readUInt16()
    const endColumn = reader.readUInt16()
    const endRow = reader.readUInt16()
    const borderFillId = reader.readUInt16()

    return new ValidZone(startColumn, startRow, endColumn, endRow, borderFillId)
  }
}

export class Cell {
  constructor(
    /** 문단 리스트 */
    public paragraphs: ParagraphList,
    /**
     * 열 주소
     * 0 부터 시작, 왼쪽으로 갈수록 커진다
     */
    public column: number,
    /**
     * 행 주소
     * 0 부터 시작, 왼쪽으로 갈수록 커진다
     */
    public row: number,
    /** 열의 병합 개수 */
    public colSpan: number,
    /** 행의 병합 개수 */
    public rowSpan: number,
    /** 너비 */
    public width: number,
    /** 높이 */
    public height: number,
    public padding: [number, number, number, number],
    public borderFillId: number,
  ) {}

  static fromRecords(
    iterator: PeekableIterator<HWPRecord>,
    version: HWPVersion,
    options: ParseOptions,
  ) {
    const record = iterator.next()
    if (record.id !== SectionTagID.HWPTAG_LIST_HEADER) {
      throw new Error('BodyText: Cell: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const paragraphs = ParagraphList.fromReader(reader, iterator, version, options)

    const column = reader.readUInt16()
    const row = reader.readUInt16()

    const colSpan = reader.readUInt16()
    const rowSpan = reader.readUInt16()

    const width = reader.readUInt32()
    const height = reader.readUInt32()

    const padding: [number, number, number, number] = [
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
      reader.readUInt16(),
    ]

    const borderFillId = reader.readUInt16() - 1

    // TODO: unknown
    reader.read(reader.remainByte())

    return new Cell(
      paragraphs,
      column,
      row,
      colSpan,
      rowSpan,
      width,
      height,
      padding,
      borderFillId,
    )
  }
}
