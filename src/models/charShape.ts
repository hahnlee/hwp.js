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

import { getRGB } from '../utils/bitUtils'

type SupportedLocaleOptions = [number, number, number, number, number, number, number]

class CharShape {
  fontId: SupportedLocaleOptions

  fontScale: SupportedLocaleOptions

  fontSpacing: SupportedLocaleOptions

  fontRatio: SupportedLocaleOptions

  fontLocation: SupportedLocaleOptions

  fontBaseSize: number

  attr: number

  shadow: [number, number, number]

  shadow2: [number, number, number]

  color: [number, number, number]

  underLineColor: [number, number, number]

  shadeColor: [number, number, number]

  shadowColor: [number, number, number]

  fontBackgroundId: number | null = null

  strikeColor: [number, number, number] | null = null

  constructor(
    fontId: SupportedLocaleOptions,
    fontScale: SupportedLocaleOptions,
    fontSpacing: SupportedLocaleOptions,
    fontRatio: SupportedLocaleOptions,
    fontLocation: SupportedLocaleOptions,
    fontBaseSize: number,
    attr: number,
    shadow: number,
    shadow2: number,
    color: number,
    underLineColor: number,
    shadeColor: number,
    shadowColor: number,
  ) {
    this.fontId = fontId
    this.fontScale = fontScale
    this.fontSpacing = fontSpacing
    this.fontRatio = fontRatio
    this.fontLocation = fontLocation
    this.fontBaseSize = fontBaseSize / 100
    this.attr = attr
    this.shadow = getRGB(shadow)
    this.shadow2 = getRGB(shadow2)
    this.color = getRGB(color)
    this.underLineColor = getRGB(underLineColor)
    this.shadeColor = getRGB(shadeColor)
    this.shadowColor = getRGB(shadowColor)
  }
}

export default CharShape
