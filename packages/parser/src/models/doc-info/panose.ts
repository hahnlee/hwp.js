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

/**
 * Panose 1.0
 * @see https://www.w3.org/Printing/stevahn.html
 */
export class Panose {
  family: number = 0

  serifStyle: number = 0

  weight: number = 0

  proportion: number = 0

  contrast: number = 0

  strokeVariation: number = 0

  armStyle: number = 0

  letterForm: number = 0

  midline: number = 0

  xHeight: number = 0

  getFontFamily() {
    if (this.family === 3) {
      return 'cursive'
    }

    if (this.family === 2) {
      if (this.serifStyle > 1 && this.serifStyle < 11) {
        return 'sans'
      }

      if (this.serifStyle > 10 && this.serifStyle < 14) {
        return 'sans-serf'
      }
    }

    return ''
  }
}
