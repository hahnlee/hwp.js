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

import { ByteReader } from '../../utils/byte-reader.js'
import { readItems } from '../../utils/record.js'
import type { HWPRecord } from '../record.js'
import { DocInfoTagID } from '../../constants/tag-id.js'
import { HWPVersion } from '../version.js'
import { BinData } from './bin-data.js'
import { FontFace } from './font-face.js'
import { BorderFill } from './border-fill.js'
import { CharShapeStyle } from './char-shape.js'
import { TabDefinition } from './tab-definition.js'
import { Numbering } from './numbering.js'
import { Bullet } from './bullet.js'
import { ParagraphShape } from './paragraph-shape.js'
import { Style } from './style.js'
import { MemoShape } from './memo-shape.js'
import { ChangeTracking } from './change-tracking.js'
import { ChangeTrackingAuthor } from './change-tracking-author.js'

const MEMO_SUPPORTED_VERSION = new HWPVersion(5, 0, 2, 1)
const TRACKING_SUPPORTED_VERSION = new HWPVersion(5, 0, 3, 2)

export class IDMappings {
  constructor(
    /** 바이너리 데이터 */
    public binaryData: BinData[],
    /** 한글 글꼴 */
    public koreanFonts: FontFace[],
    /** 영어 글꼴 */
    public englishFonts: FontFace[],
    /** 한자 글꼴 */
    public chineseCharactersFonts: FontFace[],
    /** 일어 글꼴 */
    public japaneseFonts: FontFace[],
    /** 기타 글꼴 */
    public etcFonts: FontFace[],
    /** 기호 글꼴 */
    public symbolFonts: FontFace[],
    /** 사용자 글꼴 */
    public userFonts: FontFace[],
    /** 테두리/배경 */
    public borderFills: BorderFill[],
    /** 글자 모양 */
    public charShapes: CharShapeStyle[],
    /** 탭 정의 */
    public tabDefinitions: TabDefinition[],
    /** 문단 번호 */
    public numberings: Numbering[],
    /** 글머리표 */
    public bullets: Bullet[],
    /** 문단 모양 */
    public paragraphShapes: ParagraphShape[],
    /** 스타일(문단 스타일) */
    public styles: Style[],
    /** 메모 모양 (5.0.2.1 이상) */
    public memoShapes: MemoShape[],
    /** 변경추적 (5.0.3.2 이상) */
    public changeTrackings: ChangeTracking[],
    /** 변경추적 사용자 (5.0.3.2 이상) */
    public changeTrackingAuthors: ChangeTrackingAuthor[],
  ) {}

  static fromRecords(records: Generator<HWPRecord>, version: HWPVersion) {
    const record = records.next().value!
    if (record.id !== DocInfoTagID.HWPTAG_ID_MAPPINGS) {
      throw new Error('DocInfo: IDMappings: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const binaryDataCount = reader.readInt32()
    const koreanFontsCount = reader.readInt32()
    const englishFontsCount = reader.readInt32()
    const chineseCharactersFontsCount = reader.readInt32()
    const japaneseFontsCount = reader.readInt32()
    const etcFontsCount = reader.readInt32()
    const symbolFontsCount = reader.readInt32()
    const userFontsCount = reader.readInt32()

    const borderFillsCount = reader.readInt32()
    const charShapesCount = reader.readInt32()
    const tabDefinitionsCount = reader.readInt32()
    const numberingsCount = reader.readInt32()
    const bulletsCount = reader.readInt32()
    const paragraphShapesCount = reader.readInt32()
    const stylesCount = reader.readInt32()

    const memoShapesCount = version.gte(MEMO_SUPPORTED_VERSION)
      ? reader.readInt32()
      : 0
    const changeTrackingsCount = version.gte(TRACKING_SUPPORTED_VERSION)
      ? reader.readInt32()
      : 0
    const changeTrackingAuthorsCount = version.gte(TRACKING_SUPPORTED_VERSION)
      ? reader.readInt32()
      : 0

    if (!reader.isEOF()) {
      throw new Error('DocInfo: IDMappings: Reader is not EOF')
    }

    return new IDMappings(
      readItems(records, binaryDataCount, version, BinData.fromRecord),
      readItems(records, koreanFontsCount, version, FontFace.fromRecord),
      readItems(records, englishFontsCount, version, FontFace.fromRecord),
      readItems(
        records,
        chineseCharactersFontsCount,
        version,
        FontFace.fromRecord,
      ),
      readItems(records, japaneseFontsCount, version, FontFace.fromRecord),
      readItems(records, etcFontsCount, version, FontFace.fromRecord),
      readItems(records, symbolFontsCount, version, FontFace.fromRecord),
      readItems(records, userFontsCount, version, FontFace.fromRecord),
      readItems(records, borderFillsCount, version, BorderFill.fromRecord),
      readItems(records, charShapesCount, version, CharShapeStyle.fromRecord),
      readItems(
        records,
        tabDefinitionsCount,
        version,
        TabDefinition.fromRecord,
      ),
      readItems(records, numberingsCount, version, Numbering.fromRecord),
      readItems(records, bulletsCount, version, Bullet.fromRecord),
      readItems(
        records,
        paragraphShapesCount,
        version,
        ParagraphShape.fromRecord,
      ),
      readItems(records, stylesCount, version, Style.fromRecord),
      readItems(records, memoShapesCount, version, MemoShape.fromRecord),
      readItems(
        records,
        changeTrackingsCount,
        version,
        ChangeTracking.fromRecord,
      ),
      readItems(
        records,
        changeTrackingAuthorsCount,
        version,
        ChangeTrackingAuthor.fromRecord,
      ),
    )
  }
}
