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

export class ByteReader {
  private view: DataView

  private offsetByte: number = 0

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer)
  }

  readUInt32(): number {
    const result = this.view.getUint32(this.offsetByte, true)
    this.#updateOffsetByte(4)
    return result
  }

  readInt32(): number {
    const result = this.view.getInt32(this.offsetByte, true)
    this.#updateOffsetByte(4)
    return result
  }

  readInt16(): number {
    const result = this.view.getUint16(this.offsetByte, true)
    this.#updateOffsetByte(2)
    return result
  }

  readUInt16(): number {
    const result = this.view.getUint16(this.offsetByte, true)
    this.#updateOffsetByte(2)
    return result
  }

  readInt8(): number {
    const result = this.view.getInt8(this.offsetByte)
    this.#updateOffsetByte(1)
    return result
  }

  readUInt8(): number {
    const result = this.view.getUint8(this.offsetByte)
    this.#updateOffsetByte(1)
    return result
  }

  readFloat32(): number {
    const result = this.view.getFloat32(this.offsetByte, true)
    this.#updateOffsetByte(4)
    return result
  }

  readFloat64(): number {
    const result = this.view.getFloat64(this.offsetByte, true)
    this.#updateOffsetByte(8)
    return result
  }

  readRecord(): [number, number, number] {
    const value = this.readUInt32()

    const tagID = value & 0x3FF
    const level = (value >> 10) & 0x3FF
    const size = (value >> 20) & 0xFFF

    if (size === 0xFFF) {
      return [tagID, level, this.readUInt32()]
    }

    return [tagID, level, size]
  }

  read(byte: number): ArrayBuffer {
    const result = this.view.buffer.slice(
      this.offsetByte,
      this.offsetByte + byte
    )
    this.#updateOffsetByte(byte)
    return result
  }

  readString(): string {
    const length = this.readUInt16()
    const result: string[] = []

    for (let i = 0; i < length; i += 1) {
      result.push(String.fromCharCode(this.readUInt16()))
    }

    return result.join('')
  }

  remainByte() {
    return this.view.byteLength - this.offsetByte
  }

  skipByte(offset: number) {
    this.#updateOffsetByte(offset)
  }

  isEOF() {
    return this.view.byteLength === this.offsetByte
  }

  length() {
    return this.view.byteLength
  }

  #updateOffsetByte(offset: number) {
    this.offsetByte += offset
    if (this.offsetByte > this.view.byteLength) {
      throw new Error('Out of range')
    }
  }
}
