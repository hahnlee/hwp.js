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

import { find, type CFB$Container, type CFB$Entry } from 'cfb'
import { inflate } from 'pako'
import * as aesjs from 'aes-js'

import type { HWPHeader } from './header.js'
import { Paragraph } from './paragraph.js'
import { ByteReader } from '../utils/byte-reader.js'
import { PeekableIterator } from '../utils/generator.js'
import type { ParseOptions } from '../types/parser.js'

export class Section {
  constructor(public paragraphs: Paragraph[]) {}

  static fromCFB(
    container: CFB$Container,
    index: number,
    header: HWPHeader,
    options: ParseOptions,
  ) {
    if (header.flags.distributed) {
      return Section.fromDistributed(container, index, header, options)
    }
    return Section.fromNormal(container, index, header, options)
  }

  static fromNormal(
    container: CFB$Container,
    index: number,
    header: HWPHeader,
    options: ParseOptions,
  ) {
    const entry = find(container, `Root Entry/BodyText/Section${index}`)

    if (!entry) {
      throw new Error('Section not exist')
    }

    return Section.fromBytes(Uint8Array.from(entry.content), header, options)
  }

  static fromDistributed(
    container: CFB$Container,
    index: number,
    header: HWPHeader,
    options: ParseOptions,
  ) {
    const entry = find(container, `Root Entry/ViewText/Section${index}`)
    if (!entry) {
      throw new Error('Section not exist')
    }

    const content = decodeContent(entry)
    return Section.fromBytes(content, header, options)
  }

  static fromBytes(
    content: Uint8Array,
    header: HWPHeader,
    options: ParseOptions,
  ): Section {
    if (header.flags.compressed) {
      const decoded = inflate(content, { windowBits: -15 })
      return Section.fromBuffer(decoded.buffer, header, options)
    }

    return Section.fromBuffer(content.buffer, header, options)
  }

  static fromBuffer(
    buffer: ArrayBuffer,
    header: HWPHeader,
    options: ParseOptions,
  ): Section {
    const reader = new ByteReader(buffer)
    const records = new PeekableIterator(reader.records())
    const paragraphs: Paragraph[] = []
    while (!records.isDone()) {
      paragraphs.push(Paragraph.fromRecord(records, header.version, options))
    }
    return new Section(paragraphs)
  }
}

function createRand(seed = 1) {
  let randomSeed = seed
  return () => {
    randomSeed = (randomSeed * 214013 + 2531011) & 0xffffffff
    return (randomSeed >> 16) & 0x7fff
  }
}

function decrypt(cipherText: ArrayBuffer, decKey: ArrayBuffer) {
  // eslint-disable-next-line new-cap
  const aesEcb = new aesjs.ModeOfOperation.ecb(new Uint8Array(decKey))
  const decryptedBytes = aesEcb.decrypt(new Uint8Array(cipherText))
  return decryptedBytes
}

function getDecryptionKey(data: ArrayBuffer): ArrayBuffer {
  const sha1Encoded = new Uint8Array(data)
  const sha1Decoded = new Uint8Array(sha1Encoded.length)
  const seed = new DataView(data.slice(0, 4)).getInt32(0, true)
  const offset = 4 + (seed & 0xf)
  const rand = createRand(seed)
  for (let j = 0, n = 0, k = 0; j < 256; j += 1, n -= 1) {
    if (n === 0) {
      k = rand() & 0xff
      n = (rand() & 0xf) + 1
    }
    sha1Decoded[j] = sha1Encoded[j] ^ k
  }
  const sha1ucsstr = sha1Decoded.slice(offset, 80)
  return sha1ucsstr.slice(0, 16)
}

function decodeContent(entry: CFB$Entry) {
  const content = new Uint8Array(entry.content)
  const reader = new ByteReader(content.buffer)
  const { data } = reader.readRecord()
  const encryptedData = reader.read(reader.remainByte())
  const decKey = getDecryptionKey(data)
  const decrypted = decrypt(encryptedData, decKey)
  return decrypted
}
