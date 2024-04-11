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

import { SectionTagID } from '../constants/tag-id.js'
import { getFlag } from '../utils/bit-utils.js'
import { ByteReader } from '../utils/byte-reader.js'
import { HWPRecord } from './record.js'
import { HWPVersion } from './version.js'

export class ParagraphHeader {
  constructor(
    /** control mask */
    public ctrlMask: CtrlMask,
    /** 문단 모양 아이디 참조값 */
    public paragraphShapeId: number,
    /** 문단 스타일 아이디 참조값 */
    public styleId: number,
    /** 구역 나누기 */
    public sectionBreak: boolean,
    /** 다단 나누기 */
    public columnsBreak: boolean,
    /** 쪽 나누기 */
    public pageBreak: boolean,
    /** 단 나누기 */
    public columnBreak: boolean,
    /** 글자수 */
    public chars: number,
    /** 글자 모양 정보 수 */
    public charShapes: number,
    /** range tag 정보 수 */
    public ranges: number,
    /** 각 줄에 대한 align에 대한 정보 수 */
    public aligns: number,
    public instanceId: number,
  ) {}
  /** 변경추적 병합 문단여부. (5.0.3.2 버전 이상) */
  public trackingChangeMerged?: number

  static fromRecord(record: HWPRecord, version: HWPVersion) {
    if (record.id !== SectionTagID.HWPTAG_PARA_HEADER) {
      throw new Error('BodyText: Paragraph: Record has wrong ID')
    }

    const reader = new ByteReader(record.data)

    let chars = reader.readUInt32()
    if (Math.abs(chars & 0x80000000) === 0x80000000) {
      chars &= 0x7fffffff
    }

    const ctrlMask = CtrlMask.fromBits(reader.readUInt32())

    const paragraphShapeId = reader.readUInt16()

    const styleId = reader.readUInt8()

    const breakOptions = reader.readUInt8()
    const sectionBreak = getFlag(breakOptions, 0)
    const columnsBreak = getFlag(breakOptions, 1)
    const pageBreak = getFlag(breakOptions, 2)
    const columnBreak = getFlag(breakOptions, 3)

    const charShapes = reader.readUInt16()
    const ranges = reader.readUInt16()
    const aligns = reader.readUInt16()
    const instanceId = reader.readUInt32()

    const header = new ParagraphHeader(
      ctrlMask,
      paragraphShapeId,
      styleId,
      sectionBreak,
      columnsBreak,
      pageBreak,
      columnBreak,
      chars,
      charShapes,
      ranges,
      aligns,
      instanceId,
    )

    if (version.gte(new HWPVersion(5, 0, 3, 2))) {
      header.trackingChangeMerged = reader.readUInt16()
    }

    if (!reader.isEOF()) {
      throw new Error('DocInfo: ParagraphHeader: Reader is not EOF')
    }

    return header
  }
}

export class CtrlMask {
  constructor(
    /** 구역/단 정의 */
    public sectionColumnDefinition: boolean,
    /** 필드시작 */
    public fieldStart: boolean,
    /** 필드끝 */
    public fieldEnd: boolean,
    /** 탭 */
    public tab: boolean,
    /** 강제 줄 나눔 */
    public lineBreak: boolean,
    /** 그리기 개체 / 표 */
    public shapeObjectTable: boolean,
    /** 문단 나누기 */
    public paragraphBreak: boolean,
    /** 주석 */
    public hiddenComment: boolean,
    /** 머리말 / 꼬리말 존재 여부 */
    public headerFooter: boolean,
    /** 각주 / 미주 */
    public headnoteFootnote: boolean,
    /** 자동 번호 */
    public autoNumber: boolean,
    /** 쪽바뀜 */
    public pageBreak: boolean,
    /** 책갈피 / 찾아보기 표시 */
    public bookMarkIndexMark: boolean,
    /** 덧말 / 글자 겹침 */
    public subText: boolean,
    /** 하이픈 */
    public hyphen: boolean,
    /** 묶음 빈칸 */
    public keepWordSpace: boolean,
    /** 고정 폭 빈칸 */
    public fixedWidthSpace: boolean,
  ) {}

  static fromBits(bits: number) {
    return new CtrlMask(
      getFlag(bits, 2),
      getFlag(bits, 3),
      getFlag(bits, 4),
      getFlag(bits, 9),
      getFlag(bits, 10),
      getFlag(bits, 11),
      getFlag(bits, 13),
      getFlag(bits, 15),
      getFlag(bits, 16),
      getFlag(bits, 17),
      getFlag(bits, 18),
      getFlag(bits, 21),
      getFlag(bits, 22),
      getFlag(bits, 23),
      getFlag(bits, 24),
      getFlag(bits, 30),
      getFlag(bits, 31),
    )
  }
}
