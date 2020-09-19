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

import { CFB$Container, find } from 'cfb'
import { inflate } from 'pako'

import FillType from '../constants/fillType'
import { DocInfoTagID } from '../constants/tagID'
import BinData from '../models/binData'
import ByteReader from '../utils/byteReader'
import CharShape from '../models/charShape'
import DocInfo from '../models/docInfo'
import FontFace from '../models/fontFace'
import ParagraphShape from '../models/paragraphShape'
import { getRGB, getFlag, getBitValue } from '../utils/bitUtils'
import BorderFill from '../models/borderFill'
import HWPRecord from '../models/record'
import Panose from '../models/panose'
import parseRecordTree from './parseRecord'

class DocInfoParser {
  private record: HWPRecord

  private result = new DocInfo()

  private container: CFB$Container

  constructor(data: Uint8Array, container: CFB$Container) {
    this.record = parseRecordTree(data)
    this.container = container
  }

  visitDocumentPropertes(record: HWPRecord) {
    const reader = new ByteReader(record.payload)
    this.result.sectionSize = reader.readUInt16()

    // TODO: (@hahnlee) 다른 프로퍼티도 구현하기
  }

  visitCharShape(record: HWPRecord) {
    const reader = new ByteReader(record.payload)

    const charShape = new CharShape(
      [
        reader.readUInt16(),
        reader.readUInt16(),
        reader.readUInt16(),
        reader.readUInt16(),
        reader.readUInt16(),
        reader.readUInt16(),
        reader.readUInt16(),
      ],
      [
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
      ],
      [
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
      ],
      [
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
        reader.readUInt8(),
      ],
      [
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
        reader.readInt8(),
      ],
      reader.readInt32(),
      reader.readUInt32(),
      reader.readUInt8(),
      reader.readUInt8(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
      reader.readUInt32(),
    )

    if (record.size > 68) {
      charShape.fontBackgroundId = reader.readUInt16()
    }

    if (record.size > 70) {
      charShape.underLineColor = getRGB(reader.readInt32())
    }

    this.result.charShapes.push(charShape)
  }

  visitFaceName(record: HWPRecord) {
    const reader = new ByteReader(record.payload)
    const attribute = reader.readUInt8()
    const hasAlternative = getFlag(attribute, 7)
    const hasAttribute = getFlag(attribute, 6)
    const hasDefault = getFlag(attribute, 5)

    const fontFace = new FontFace()
    fontFace.name = reader.readString()

    if (hasAlternative) {
      reader.skipByte(1)
      fontFace.alternative = reader.readString()
    }

    if (hasAttribute) {
      const panose = new Panose()
      panose.family = reader.readInt8()
      panose.serifStyle = reader.readInt8()
      panose.weight = reader.readInt8()
      panose.proportion = reader.readInt8()
      panose.contrast = reader.readInt8()
      panose.strokeVariation = reader.readInt8()
      panose.armStyle = reader.readInt8()
      panose.letterForm = reader.readInt8()
      panose.midline = reader.readInt8()
      panose.xHeight = reader.readInt8()

      fontFace.panose = panose
    }

    if (hasDefault) {
      fontFace.default = reader.readString()
    }

    this.result.fontFaces.push(fontFace)
  }

  visitBinData(record: HWPRecord) {
    const reader = new ByteReader(record.payload)
    reader.readUInt16()
    const id = reader.readUInt16()
    const extension = reader.readString()
    const path = `Root Entry/BinData/BIN${`${id.toString(16).toUpperCase()}`.padStart(4, '0')}.${extension}`
    const payload = find(this.container, path)!.content as Uint8Array
    this.result.binData.push(new BinData(extension, inflate(payload, { windowBits: -15 })))
  }

  visitBorderFill(record: HWPRecord) {
    const reader = new ByteReader(record.payload)

    const borderFill = new BorderFill(
      reader.readUInt16(),
      {
        left: {
          type: reader.readUInt8(),
          width: reader.readUInt8(),
          color: getRGB(reader.readUInt32()),
        },
        right: {
          type: reader.readUInt8(),
          width: reader.readUInt8(),
          color: getRGB(reader.readUInt32()),
        },
        top: {
          type: reader.readUInt8(),
          width: reader.readUInt8(),
          color: getRGB(reader.readUInt32()),
        },
        bottom: {
          type: reader.readUInt8(),
          width: reader.readUInt8(),
          color: getRGB(reader.readUInt32()),
        },
      },
    )

    reader.skipByte(6)

    if (reader.readUInt32() === FillType.Single) {
      borderFill.backgroundColor = getRGB(reader.readUInt32())
    }

    this.result.borderFills.push(borderFill)
  }

  visitParagraphShape(record: HWPRecord) {
    const reader = new ByteReader(record.payload)
    const attribute = reader.readUInt32()

    const shape = new ParagraphShape()
    shape.align = getBitValue(attribute, 2, 4)
    this.result.paragraphShapes.push(shape)
  }

  private visit = (record: HWPRecord) => {
    switch (record.tagID) {
      case DocInfoTagID.HWPTAG_DOCUMENT_PROPERTIES: {
        this.visitDocumentPropertes(record)
        break
      }

      case DocInfoTagID.HWPTAG_CHAR_SHAPE: {
        this.visitCharShape(record)
        break
      }

      case DocInfoTagID.HWPTAG_FACE_NAME: {
        this.visitFaceName(record)
        break
      }

      case DocInfoTagID.HWPTAG_BIN_DATA: {
        this.visitBinData(record)
        break
      }

      case DocInfoTagID.HWPTAG_BORDER_FILL: {
        this.visitBorderFill(record)
        break
      }

      case DocInfoTagID.HWPTAG_PARA_SHAPE: {
        this.visitParagraphShape(record)
        break
      }

      default:
        break
    }

    record.children.forEach(this.visit)
  }

  parse() {
    this.record.children.forEach(this.visit)
    return this.result
  }
}

export default DocInfoParser
