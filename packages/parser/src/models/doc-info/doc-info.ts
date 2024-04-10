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

import { CharShape } from './char-shape.js'
import { FontFace } from './font-face.js'
import { BinData } from './bin-data.js'
import { BorderFill } from './border-fill.js'
import { ParagraphShape } from './paragraph-shape.js'
import { StartingIndex } from './starting-index.js'
import { CaratLocation } from './carat-location.js'
import { LayoutCompatibility } from './layout-compatibility.js'

export class DocInfo {
  sectionSize: number = 0

  charShapes: CharShape[] = []

  fontFaces: FontFace[] = []

  binData: BinData[] = []

  borderFills: BorderFill[] = []

  paragraphShapes: ParagraphShape[] = []

  startingIndex: StartingIndex = new StartingIndex()

  caratLocation: CaratLocation = new CaratLocation()

  compatibleDocument: number = 0

  layoutCompatibility: LayoutCompatibility = new LayoutCompatibility()

  getCharShape(index: number): CharShape | undefined {
    return this.charShapes[index]
  }
}
