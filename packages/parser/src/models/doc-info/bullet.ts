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
import { ParagraphHead } from './numbering.js'

export class Bullet {
  constructor(
    /** 문단 머리의 정보 */
    public paragraphHead: ParagraphHead,
    /** 글머리표 문자 */
    public bulletChar: string,
    /** 이미지 글머리표 여부 */
    public useImage: boolean,
    /** 이미지 정보 */
    public image: Image,
    /** 체크 글머리표 문자 */
    public checkedChar: string,
  ) {}

  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_BULLET) {
      throw new Error('DocInfo: Bullet: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    const paragraphHead = ParagraphHead.fromReader(reader, false)
    const bulletChar = String.fromCharCode(reader.readUInt16())
    const useImage = reader.readUInt32() > 0
    const image = Image.fromReader(reader)
    const checkedChar = String.fromCharCode(reader.readUInt16())

    if (!reader.isEOF()) {
      throw new Error('DocInfo: Bullet: Reader is not EOF')
    }

    return new Bullet(paragraphHead, bulletChar, useImage, image, checkedChar)
  }
}

export class Image {
  constructor(
    /** 밝기 */
    public bright: number,
    /** 명암 */
    public contrast: number,
    /** 그림 효과 */
    public effect: ImageEffect,
    /** BinItem의 아이디 참조값 */
    public binItemId: number,
  ) {}

  static fromReader(reader: ByteReader) {
    const bright = reader.readUInt8()
    const contrast = reader.readUInt8()
    const effect = reader.readUInt8()
    const binItemId = reader.readUInt16()
    return new Image(bright, contrast, effect, binItemId)
  }
}

export enum ImageEffect {
  /** 원래 그림에서 */
  RealPic,
  /** 그레이스케일로 */
  GrayScale,
  /** 흑백으로 */
  BlackWhite,
  /** 패턴 8x8 */
  Pattern8x8,
}
