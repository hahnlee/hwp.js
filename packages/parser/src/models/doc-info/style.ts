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
import { ByteReader } from '../../utils/byte-reader.js'
import type { HWPRecord } from '../record.js'

export class Style {
  constructor(
    /** 로컬 스타일 이름. 한글 윈도우에서는 한글 스타일 이름 */
    public name: string,
    /** 영문 스타일 이름 */
    public englishName: string,
    /** 스타일 종류 */
    public kind: StyleKind,
    /**
     * 다음 스타일 아이디 참조값
     * 문단 스타일에서 사용자가 리턴키를 입력하여 다음 문단으로 이동했을때 적용할 스타일
     */
    public nextStyleId: number,
    /**
     * 언어코드
     * @link https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oe376/6c085406-a698-4e12-9d4d-c3b0ee3dbc4a
     */
    public langId: number,
    /** 문단 모양 아이디 참조값(문단 모양의 아이디 속성) */
    public paragraphShapeId: number,
    /** 글자 모양 아이디(글자 모양의 아이디 속성) */
    public charShapeId: number,
    /**
     * HWP 포맷문서에는 없지만 HWPX 포맷문서에 정의되어 있음
     * 양식모드에서 style 보호하기 여부
     */
    public lockForm: number,
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_STYLE) {
      throw new Error('DocInfo: Style: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const name = reader.readString()
    const englishName = reader.readString()
    const kind = mapStyleKind(reader.readUInt8())
    const nextStyleId = reader.readUInt8()
    const langId = reader.readUInt16()
    const paragraphShapeId = reader.readUInt16()
    const charShapeId = reader.readUInt16()

    // NOTE: (@hahnlee) HWP 포맷문서에는 없지만 HWPX 포맷문서에 정의되어 있음
    const lockForm = reader.readUInt16()

    if (!reader.isEOF()) {
      throw new Error('DocInfo: Style: Reader is not EOF')
    }

    return new Style(
      name,
      englishName,
      kind,
      nextStyleId,
      langId,
      paragraphShapeId,
      charShapeId,
      lockForm,
    )
  }
}

export enum StyleKind {
  /** 문단 스타일 */
  Para,
  /** 글자 스타일 */
  Char,
}

function mapStyleKind(value: number) {
  if (value >= StyleKind.Para && value <= StyleKind.Char) {
    return value as StyleKind
  }
  throw new Error(`Unknown StyleKind: ${value}`)
}
