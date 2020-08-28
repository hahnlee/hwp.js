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

import * as fs from 'fs'
import * as path from 'path'

import HWPDocument from '../../models/document'
import HWPVersion from '../../models/version'
import parse from '../parse'

const reportFilePath = path.join(__dirname, 'data', 'basicsReport.hwp')
const reportFile = fs.readFileSync(reportFilePath)

describe('parse', () => {
  const hwpDocument = parse(reportFile, { type: 'binary' })

  it('should parse HWP file', () => {
    expect(hwpDocument instanceof HWPDocument).toBe(true)
    expect(hwpDocument.header.version).toEqual(new HWPVersion(5, 0, 2, 4))
  })

  it('should parse collect sectionNumber', () => {
    expect(hwpDocument.info.sectionSize).toEqual(1)
  })

  // TODO: (@hahnlee) Table 복원후 살리기
  it.skip('should be collect page size', () => {
    expect(hwpDocument.sections.length).toBe(1)

    // A4 width / height
    expect(hwpDocument.sections[0].width).toBe(59528)
    expect(hwpDocument.sections[0].height).toBe(84188)
  })
})
