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

import { TableColumnOption, ParagraphList } from '@hwp.js/parser'

function splitTable(
  table: ParagraphList<TableColumnOption>[][],
  overflowColumns: (ParagraphList<TableColumnOption> | undefined)[],
  currentHeight: number,
  contentHeight: number,
): ParagraphList<TableColumnOption>[][][] {
  let targetHeight = currentHeight
  let tableHeight = 0
  let splitRowIndex = -1
  let overflow: (ParagraphList<TableColumnOption> | undefined)[] = overflowColumns

  const columns: ParagraphList<TableColumnOption>[][] = []
  const rowHeights: number[] = []

  for (let i = 0; i < table.length; i += 1) {
    const row = table[i]

    const rowHeight = Math.min(...row.map((column) => column.attribute.height))
    rowHeights.push(rowHeight)

    tableHeight += rowHeight

    if (targetHeight >= tableHeight) {
      columns.push(row)
    } else {
      splitRowIndex = i
      break
    }
  }

  for (let i = 0; i < overflow.length; i += 1) {
    const firstRow = columns[0]!
    const column = overflow[i]

    if (column) {
      firstRow.splice(column.attribute.column, 0, column)
    }
  }

  overflow = []

  columns.forEach((row, rowIndex) => {
    row.forEach((column) => {
      if (column.attribute.height > targetHeight) {
        const columnHeight = column.attribute.height
        const columnRowSpan = column.attribute.rowSpan

        const nextRowSpan = columnRowSpan - (splitRowIndex - rowIndex - 2)

        column.attribute.height = targetHeight
        column.attribute.rowSpan = nextRowSpan

        overflow[column.attribute.column] = new ParagraphList<TableColumnOption>({
          ...column.attribute,
          row: 0,
          height: columnHeight - targetHeight,
          rowSpan: columnRowSpan - nextRowSpan,
        }, [])
      }
    })

    targetHeight -= rowHeights[rowIndex]
  })

  if (splitRowIndex < 0) {
    return [columns]
  }

  const next = splitTable(
    table.slice(splitRowIndex),
    overflow,
    contentHeight,
    contentHeight,
  )

  return [
    columns,
    ...next,
  ]
}

export default splitTable
