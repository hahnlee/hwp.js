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
import { getBitValue } from '../../utils/bit-utils.js'
import { ByteReader } from '../../utils/byte-reader.js'
import { HWPHeader } from '../header.js'
import type { HWPRecord } from '../record.js'

export enum BinDataKind {
  /** 그림 외부 파일 참조 */
  Link,
  /** 그림 파일 포함  */
  Embedding,
  /** OLE 포함 */
  Storage,
}

export enum CompressMode {
  /** 스토리지의 디폴트 모드 따라감 */
  Default,
  /** 무조건 압축 */
  Compress,
  /** 무조건 압축하지 않음 */
  None,
}

export enum BinDataStatus {
  /** 아직 access 된 적이 없는 상태 */
  Initial,
  /** access에 성공하여 파일을 찾은 상태 */
  Success,
  /** access가 실패한 에러 상태 */
  Failed,
  /** 링크 access가 실패했으나 무시된 상태 */
  Ignored,
}

export class BinDataProperties {
  constructor(
    /** 타입 */
    public kind: BinDataKind,
    /** 압축 모드 */
    public compressMode: CompressMode,
    /** 상태 */
    public status: BinDataStatus,
  ) {}

  static fromBits(bits: number) {
    return new BinDataProperties(
      mapBinDataKind(getBitValue(bits, 0, 3)),
      mapCompressMode(getBitValue(bits, 4, 5)),
      mapBinDataStatus(getBitValue(bits, 8, 9)),
    )
  }
}

export class BinData {
  constructor(public properties: BinDataProperties) {}

  public absolutePath?: string
  public relativePath?: string
  public id?: number
  public extension?: string

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_BIN_DATA) {
      throw new Error('DocInfo: BinData: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)
    const properties = BinDataProperties.fromBits(reader.readUInt16())

    const binData = new BinData(properties)
    if (properties.kind === BinDataKind.Link) {
      binData.absolutePath = reader.readString()
      binData.relativePath = reader.readString()
    }

    if (properties.kind === BinDataKind.Embedding) {
      binData.id = reader.readUInt16()
      binData.extension = reader.readString()
    }

    if (properties.kind === BinDataKind.Storage) {
      binData.id = reader.readUInt16()
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: BinData: Reader is not EOF')
    }

    return binData
  }

  getCFBFileName() {
    if (this.properties.kind !== BinDataKind.Embedding) {
      return null
    }

    const extension = this.extension?.toLowerCase()
    const id = this.id?.toString(16).padStart(4, '0')

    return `BIN${id}.${extension}`
  }

  public compressed(header: HWPHeader) {
    switch (this.properties.compressMode) {
      case CompressMode.Default:
        return header.flags.compressed
      case CompressMode.Compress:
        return true
      case CompressMode.None:
        return false
    }
  }
}

function mapBinDataKind(value: number) {
  if (value >= BinDataKind.Link && value <= BinDataKind.Storage) {
    return value as BinDataKind
  }
  throw new Error(`Unknown BinDataKind: ${value}`)
}

function mapCompressMode(value: number) {
  if (value >= CompressMode.Default && value <= CompressMode.None) {
    return value as CompressMode
  }
  throw new Error(`Unknown CompressMode: ${value}`)
}

function mapBinDataStatus(value: number) {
  if (value >= BinDataStatus.Initial && value <= BinDataStatus.Ignored) {
    return value as BinDataStatus
  }
  throw new Error(`Unknown BinDataStatus: ${value}`)
}
