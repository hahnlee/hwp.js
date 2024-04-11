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

import { ByteReader } from '../utils/byte-reader.js'

export enum CharControls {
  Unusable = 0,
  LineBreak = 10,
  ParaBreak = 13,
  Hyphen = 24,
  Reserved1 = 25,
  Reserved2 = 26,
  Reserved3 = 27,
  Reserved4 = 28,
  Reserved5 = 29,
  /** 묶음 빈칸 */
  KeepWordSpace = 30,
  /** 고정폭 빈칸 */
  FixedWidthSpace = 31,
}

export type HWPChar = CharCode | CharControl | InlineControl | ExtendedControl

export class CharCode {
  public bytes = 1

  constructor(public code: number) {}

  toString() {
    return String.fromCharCode(this.code)
  }
}

export class CharControl {
  public bytes = 1

  constructor(public control: CharControls) {}

  toString() {
    return ''
  }
}

export class InlineControl {
  public bytes = 8

  constructor(public code: number, public buffer: ArrayBuffer) {}

  toString() {
    return ''
  }
}

export class ExtendedControl {
  public bytes = 8

  constructor(public code: number, public buffer: ArrayBuffer) {}

  toString() {
    return ''
  }
}

function matchCharControl(input: number) {
  switch (input) {
    case 0:
      return CharControls.Unusable
    case 10:
      return CharControls.LineBreak
    case 13:
      return CharControls.ParaBreak
    case 24:
      return CharControls.Hyphen
    case 25:
      return CharControls.Reserved1
    case 26:
      return CharControls.Reserved2
    case 27:
      return CharControls.Reserved3
    case 28:
      return CharControls.Reserved4
    case 29:
      return CharControls.Reserved5
    case 30:
      return CharControls.KeepWordSpace
    case 31:
      return CharControls.FixedWidthSpace
    default:
      return null
  }
}

export function readChar(reader: ByteReader) {
  const code = reader.readUInt16()

  if (code > 31) {
    return new CharCode(code)
  }

  const charControl = matchCharControl(code)
  if (charControl) {
    return new CharControl(charControl)
  }

  const buf = reader.read(12)

  const other = reader.readUInt16()
  if (code !== other) {
    throw new Error('invalid char')
  }

  switch (code) {
    case 1:
    case 2:
    case 3:
    case 11:
    case 12:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
    case 21:
    case 22:
    case 23:
      return new ExtendedControl(code, buf)
    default:
      return new InlineControl(code, buf)
  }
}
