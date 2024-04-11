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

import { getBitValue } from '../utils/bit-utils.js'

export class ColorRef {
  constructor(public red: number, public green: number, public blue: number) {}

  static fromBits(bits: number) {
    return new ColorRef(
      getBitValue(bits, 0, 7),
      getBitValue(bits, 8, 15),
      getBitValue(bits, 16, 23),
    )
  }

  toHex() {
    return `#${this.red.toString(16)}${this.green.toString(
      16,
    )}${this.blue.toString(16)}`
  }
}
