/**
 * Copyright 2020-Present Han Lee <hanlee.dev@gmail.com>
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
  CFB$Blob,
  CFB$Container,
  CFB$ParsingOptions,
} from 'cfb'
import { inflate } from 'pako'

import HWPDocument from '../models/document'
import DocInfo from '../models/docInfo'
import HWPHeader from '../models/header'
import HWPVersion from '../models/version'
import Section from '../models/section'
import DocInfoParser from './DotInfoParser'
import SectionParser from './SectionParser'

// @link https://github.com/hahnlee/hwp.js/blob/master/docs/hwp/5.0/FileHeader.md#%ED%8C%8C%EC%9D%BC-%EC%9D%B8%EC%8B%9D-%EC%A0%95%EB%B3%B4
const FILE_HEADER_BYTES = 256

const SUPPORTED_VERSION = new HWPVersion(5, 1, 0, 0)

function parseFileHeader(container: CFB$Container): HWPHeader {
  const fileHeader = find(container, 'FileHeader')

  if (!fileHeader) {
    throw new Error('Cannot find FileHeader')
  }

  const { content } = fileHeader

  if (content.length !== FILE_HEADER_BYTES) {
    throw new Error(`FileHeader must be ${FILE_HEADER_BYTES} bytes, Received: ${content.length}`)
  }

  // TODO: (@hahnlee) 파일 시그니처 검증하기

  const [major, minor, build, revision] = Array.from(content.slice(32, 36)).reverse()
  const version = new HWPVersion(major, minor, build, revision)

  if (!version.isCompatible(SUPPORTED_VERSION)) {
    throw new Error(`hwp.js only support ${SUPPORTED_VERSION} format. Received version: ${version}`)
  }

  return new HWPHeader(version)
}

function parseDocInfo(container: CFB$Container): DocInfo {
  const docInfoEntry = find(container, 'DocInfo')

  if (!docInfoEntry) {
    throw new Error('DocInfo not exist')
  }

  const content: Uint8Array = docInfoEntry.content as Uint8Array
  const decodedContent: Uint8Array = inflate(content, { windowBits: -15 })

  return new DocInfoParser(decodedContent, container).parse()
}

function parseSection(container: CFB$Container, sectionNumber: number): Section {
  const section = find(container, `Root Entry/BodyText/Section${sectionNumber}`)

  if (!section) {
    throw new Error('Section not exist')
  }

  const content: Uint8Array = section.content as Uint8Array
  const decodedContent: Uint8Array = inflate(content, { windowBits: -15 })

  return new SectionParser(decodedContent).parse()
}

function parse(input: CFB$Blob, options?: CFB$ParsingOptions): HWPDocument {
  const container: CFB$Container = read(input, options)

  const header = parseFileHeader(container)
  const docInfo = parseDocInfo(container)

  const sections: Section[] = []

  for (let i = 0; i < docInfo.sectionSize; i += 1) {
    sections.push(parseSection(container, i))
  }

  return new HWPDocument(header, docInfo, sections)
}

export default parse
