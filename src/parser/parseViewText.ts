// Reference 1 : https://cdn.hancom.com/link/docs/%ED%95%9C%EA%B8%80%EB%AC%B8%EC%84%9C%ED%8C%8C%EC%9D%BC%ED%98%95%EC%8B%9D_%EB%B0%B0%ED%8F%AC%EC%9A%A9%EB%AC%B8%EC%84%9C_revision1.2.hwp
// Reference 2 : https://groups.google.com/g/hwp-foss/c/d2KL2ypR89Q

import {
  find,
  CFB$Container,
  CFB$Entry,
} from 'cfb'
import { inflate } from 'pako'
import * as aesjs from 'aes-js'

import Section from '../models/section'
import SectionParser from './SectionParser'
import ByteReader from '../utils/byteReader'

function createRand(seed = 1) {
  let randomSeed = seed
  return () => {
    randomSeed = (randomSeed * 214013 + 2531011) & 0xFFFFFFFF
    return (randomSeed >> 16) & 0x7FFF
  }
}

function decrypt(cipherText: ArrayBuffer, decKey: ArrayBuffer) {
  // eslint-disable-next-line new-cap
  const aesEcb = new aesjs.ModeOfOperation.ecb(new Uint8Array(decKey))
  const decryptedBytes = aesEcb.decrypt(new Uint8Array(cipherText))
  return decryptedBytes
}

function getDecryptionKey(data: ArrayBuffer) : ArrayBuffer {
  const sha1Encoded = new Uint8Array(data)
  const sha1Decoded = new Uint8Array(sha1Encoded.length)
  const seed = (new DataView(data.slice(0, 4))).getInt32(0, true)
  const offset = 4 + (seed & 0xF)
  const rand = createRand(seed)
  for (let j = 0, n = 0, k = 0; j < 256; j += 1, n -= 1) {
    if (n === 0) {
      k = rand() & 0xFF
      n = (rand() & 0xF) + 1
    }
    sha1Decoded[j] = sha1Encoded[j] ^ k
  }
  const sha1ucsstr = sha1Decoded.slice(offset, 80)
  return sha1ucsstr.slice(0, 16)
}

function parseViewTextSection(entry: CFB$Entry): Section {
  const content = new Uint8Array(entry.content)
  const reader = new ByteReader(content.buffer)
  const [, , size] = reader.readRecord()
  const distDocData = reader.read(size)
  const encryptedData = reader.read(reader.remainByte())
  const decKey = getDecryptionKey(distDocData)
  const decrypted = decrypt(encryptedData, decKey)
  const decodedContent: Uint8Array = inflate(decrypted, { windowBits: -15 })
  const section: Section = new SectionParser(decodedContent).parse()
  return section
}

function parseViewText(container: CFB$Container): Section[] {
  const view = find(container, 'Root Entry/ViewText/')
  const viewPaths = container.FullPaths.filter((e: string) => e.startsWith('Root Entry/ViewText/Section'))
  const sections: Section[] = []

  if (view && viewPaths.length > 0) {
    for (let i = 0; i < viewPaths.length; i += 1) {
      const entry = find(container, `Root Entry/ViewText/Section${i}`)
      if (entry != null) {
        sections.push(parseViewTextSection(entry))
      }
    }
  }

  return sections
}

export default parseViewText
