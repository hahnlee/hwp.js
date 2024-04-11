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
import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import * as fs from 'fs'
import * as path from 'path'

import { HWPDocument } from '../models/document.js'
import { HWPVersion } from '../models/version.js'
import { parse } from '../parse.js'

const reportFilePath = path.join(import.meta.dirname, 'data', 'basics-report.hwp')
const reportFile = fs.readFileSync(reportFilePath)

describe('parse', () => {
  const hwpDocument = parse(reportFile)

  it('should parse HWP file', () => {
    assert.strictEqual(hwpDocument instanceof HWPDocument, true)
    assert.strictEqual(hwpDocument.header.version.toString(), new HWPVersion(5, 0, 2, 4).toString())
  })

  it('should parse collect sectionNumber', () => {
    assert.strictEqual(hwpDocument.info.sectionSize, 1)
  })

  it('should be collect page size', () => {
    assert.strictEqual(hwpDocument.sections.length, 1)
  })
})
