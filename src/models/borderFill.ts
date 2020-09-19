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

import { RGB } from '../types/color'

interface BorerStyle {
  type: number
  width: number
  color: RGB
}

export interface BorderFillStyle {
  left: BorerStyle
  right: BorerStyle
  top: BorerStyle
  bottom: BorerStyle
}

class BorderFill {
  // TODO: (@hahnlee) getter & setter 만들기
  attrubute: number

  style: BorderFillStyle

  // TODO: (@hahnlee) 그라데이션도 처리하기
  backgroundColor: RGB | null = null

  constructor(
    attrubute: number,
    style: BorderFillStyle,
  ) {
    this.attrubute = attrubute
    this.style = style
  }
}

export default BorderFill
