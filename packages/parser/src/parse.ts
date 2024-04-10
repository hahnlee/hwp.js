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

import {
  read,
  find,
  type CFB$Blob,
  type CFB$Container,
} from 'cfb'
import { inflate } from 'pako'

import HWPDocument from './models/document.js'
import DocInfo from './models/docInfo.js'
import HWPHeader from './models/header.js'
import HWPVersion from './models/version.js'
import Section from './models/section.js'
import DocInfoParser from './DocInfoParser.js'
import SectionParser from './SectionParser.js'
import ByteReader from './utils/byteReader.js'
import { getBitValue } from './utils/bitUtils.js'

// @link https://github.com/hahnlee/hwp.js/blob/master/docs/hwp/5.0/FileHeader.md#%ED%8C%8C%EC%9D%BC-%EC%9D%B8%EC%8B%9D-%EC%A0%95%EB%B3%B4
const FILE_HEADER_BYTES = 256

const SUPPORTED_VERSION = new HWPVersion(5, 1, 0, 0)
const SIGNATURE = 'HWP Document File'

function parseFileHeader(container: CFB$Container): HWPHeader {
  const fileHeader = find(container, 'FileHeader')

  if (!fileHeader) {
    throw new Error('Cannot find FileHeader')
  }

  const { content } = fileHeader

  if (content.length !== FILE_HEADER_BYTES) {
    throw new Error(`FileHeader must be ${FILE_HEADER_BYTES} bytes, Received: ${content.length}`)
  }

  const signature = String.fromCharCode(...Array.from(content.slice(0, 17)))
  if (SIGNATURE !== signature) {
    throw new Error(`hwp file's signature should be ${SIGNATURE}. Received version: ${signature}`)
  }

  const [major, minor, build, revision] = Array.from(content.slice(32, 36)).reverse()
  const version = new HWPVersion(major, minor, build, revision)

  if (!version.isCompatible(SUPPORTED_VERSION)) {
    throw new Error(`hwp.js only support ${SUPPORTED_VERSION.toString()} format. Received version: ${version.toString()}`)
  }

  const reader = new ByteReader(Uint8Array.from(content).buffer)

  // signature bytes + version bytes
  reader.skipByte(32 + 4)

  const data = reader.readUInt32()

  return new HWPHeader(version, signature, {
    compressed: Boolean(getBitValue(data, 0)),
    encrypted: Boolean(getBitValue(data, 1)),
    distribution: Boolean(getBitValue(data, 2)),
    script: Boolean(getBitValue(data, 3)),
    drm: Boolean(getBitValue(data, 4)),
    hasXmlTemplateStorage: Boolean(getBitValue(data, 5)),
    vcs: Boolean(getBitValue(data, 6)),
    hasElectronicSignatureInfomation: Boolean(getBitValue(data, 7)),
    certificateEncryption: Boolean(getBitValue(data, 8)),
    prepareSignature: Boolean(getBitValue(data, 9)),
    certificateDRM: Boolean(getBitValue(data, 10)),
    ccl: Boolean(getBitValue(data, 11)),
    mobile: Boolean(getBitValue(data, 12)),
    isPrivacySecurityDocument: Boolean(getBitValue(data, 13)),
    trackChanges: Boolean(getBitValue(data, 14)),
    kogl: Boolean(getBitValue(data, 15)),
    hasVideoControl: Boolean(getBitValue(data, 16)),
    hasOrderFieldControl: Boolean(getBitValue(data, 17)),
  })
}

function parseDocInfo(container: CFB$Container, header: HWPHeader): DocInfo {
  const docInfoEntry = find(container, 'DocInfo')

  if (!docInfoEntry) {
    throw new Error('DocInfo not exist')
  }

  const content = docInfoEntry.content

  if (header.properties.compressed) {
    const decodedContent = inflate(Uint8Array.from(content), { windowBits: -15 })
    return new DocInfoParser(header, decodedContent, container).parse()
  } else {
    return new DocInfoParser(header, Uint8Array.from(content), container).parse()
  }
}

function parseSection(container: CFB$Container, header: HWPHeader, sectionNumber: number): Section {
  const section = find(container, `Root Entry/BodyText/Section${sectionNumber}`)

  if (!section) {
    throw new Error('Section not exist')
  }

  const content = section.content

  if (header.properties.compressed) {
    const decodedContent = inflate(Uint8Array.from(content), { windowBits: -15 })
    return new SectionParser(decodedContent).parse()
  } else {
    return new SectionParser(Uint8Array.from(content)).parse()
  }
}

export function parse(input: CFB$Blob): HWPDocument {
  const container: CFB$Container = read(input, {
    type: 'array',
  })

  const header = parseFileHeader(container)
  const docInfo = parseDocInfo(container, header)

  const sections: Section[] = []

  for (let i = 0; i < docInfo.sectionSize; i += 1) {
    sections.push(parseSection(container, header, i))
  }

  return new HWPDocument(header, docInfo, sections)
}
