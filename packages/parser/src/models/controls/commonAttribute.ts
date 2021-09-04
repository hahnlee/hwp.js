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

export enum VertRelTo {
  Paper,
  Page,
  Paragraph,
}

export enum HorzRelTo {
  Page,
  Column,
  Paragraph,
}

export enum WidthCriterion {
  Paper,
  Page,
  Column,
  Paragraph,
  Absolute,
}

export enum HeightCriterion {
  Paper,
  Page,
  Absolute,
}

export enum TextFlowMethod {
  Square,
  Tight,
  Through,
  TopAndBottom,
  BehindText,
  InFrontOfText,
}

export enum TextHorzArrange {
  BothSides,
  LeftOnly,
  RightOnly,
  LargestOnly,
}

export enum ObjectType {
  None,
  Figure,
  Table,
  Equation,
}

class CommonAttribute {
  isTextLike: boolean = false

  isApplyLineSpace: boolean = false

  vertRelTo: VertRelTo = VertRelTo.Paper

  vertRelativeArrange: number = 0

  horzRelTo: HorzRelTo = HorzRelTo.Page

  horzRelativeArrange: number = 0

  isVertRelToParaLimit: boolean = false

  isAllowOverlap: boolean = false

  widthCriterion: WidthCriterion = WidthCriterion.Paper

  heightCriterion: HeightCriterion = HeightCriterion.Paper

  isProtectSize: boolean = false

  textFlowMethod: TextFlowMethod = TextFlowMethod.Square

  textHorzArrange: TextHorzArrange = TextHorzArrange.BothSides

  objectType: ObjectType = ObjectType.None

  setHorzRelTo(value: number) {
    // NOTE: (hanlee) 한글 표준 문서에따르면 0과 1 모두 page이다
    if (value === 0 || value === 1) {
      this.horzRelTo = HorzRelTo.Page
    }

    if (value === 2) {
      this.horzRelTo = HorzRelTo.Column
    }

    if (value === 3) {
      this.horzRelTo = HorzRelTo.Paragraph
    }
  }

  getVertAlign(): string | null {
    if (this.vertRelativeArrange === 0) {
      if (this.vertRelTo === VertRelTo.Paper || this.vertRelTo === VertRelTo.Page) {
        return 'top'
      }

      return 'left'
    }

    if (this.vertRelativeArrange === 1) {
      if (this.vertRelTo === VertRelTo.Paper || this.vertRelTo === VertRelTo.Page) {
        return 'center'
      }
    }

    if (this.vertRelativeArrange === 2) {
      if (this.vertRelTo === VertRelTo.Paper || this.vertRelTo === VertRelTo.Page) {
        return 'bottom'
      }

      return 'right'
    }

    if (this.vertRelativeArrange === 3) {
      if (this.vertRelTo === VertRelTo.Paper || this.vertRelTo === VertRelTo.Page) {
        return 'inside'
      }
    }

    if (this.vertRelativeArrange === 4) {
      if (this.vertRelTo === VertRelTo.Paper || this.vertRelTo === VertRelTo.Page) {
        return 'outside'
      }
    }

    return null
  }

  getHorzAlign(): string | null {
    if (this.horzRelativeArrange === 0) {
      if (this.horzRelTo === HorzRelTo.Page) {
        return 'top'
      }

      return 'left'
    }

    if (this.horzRelativeArrange === 1) {
      if (this.horzRelTo === HorzRelTo.Page) {
        return 'center'
      }
    }

    if (this.horzRelativeArrange === 2) {
      if (this.horzRelTo === HorzRelTo.Page) {
        return 'bottom'
      }

      return 'right'
    }

    if (this.horzRelativeArrange === 3) {
      if (this.horzRelTo === HorzRelTo.Page) {
        return 'inside'
      }
    }

    if (this.horzRelativeArrange === 4) {
      if (this.horzRelTo === HorzRelTo.Page) {
        return 'outside'
      }
    }

    return null
  }
}

export default CommonAttribute
