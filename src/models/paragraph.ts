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

import HWPChar from './char'
import ShapePointer from './shapePointer'

class Paragraph {
  content: HWPChar[] = []

  shapeBuffer: ShapePointer[] = []

  getShapeEndPos(index: number): number {
    if (index === this.shapeBuffer.length - 1) {
      return this.content.length - 1
    }

    return this.shapeBuffer[index + 1].pos - 1
  }
}

export default Paragraph
