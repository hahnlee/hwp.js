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

import ParagraphList from '../paragraphList'
import CommonControl from './common'

export interface TableColumnOption {
  column: number
  row: number
  colSpan: number
  rowSpan: number
  width: number
  height: number
  padding: [number, number, number, number]
  borderFillID: number
}

class TableControl extends CommonControl {
  // TODO: (@hahnlee) setter 만들기
  tableAttribute: number = 0

  rowCount: number = 0

  columnCount: number = 0

  borderFillID: number = 0

  content: ParagraphList<TableColumnOption>[][] = []

  addRow(row: number, list: ParagraphList<TableColumnOption>) {
    if (!this.content[row]) {
      this.content[row] = []
    }

    this.content[row].push(list)
  }
}

export default TableControl
