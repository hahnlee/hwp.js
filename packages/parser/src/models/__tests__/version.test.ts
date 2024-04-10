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

import { HWPVersion } from '../version.js'

describe('HWPVersion', () => {
  it('should make correct version string', () => {
    const testVersion = new HWPVersion(5, 0, 3, 1)
    assert.strictEqual(testVersion.toString(), '5.0.3.1')
  })

  it('should return version string', () => {
    const testVersion = new HWPVersion(5, 0, 3, 1)
    assert.strictEqual(JSON.stringify(testVersion), JSON.stringify('5.0.3.1'))
  })

  it('should return correct compatible', () => {
    const targetVersion = new HWPVersion(5, 3, 0, 0)

    const highMajorVersion = new HWPVersion(6, 0, 1, 2)
    assert.strictEqual(highMajorVersion.isCompatible(targetVersion), false)

    const sameMajorAndHigerMinorVersion = new HWPVersion(5, 4, 1, 7)
    assert.strictEqual(sameMajorAndHigerMinorVersion.isCompatible(targetVersion), false)

    const sameMajorAndSameMinorVersion = new HWPVersion(5, 3, 1, 7)
    assert.strictEqual(sameMajorAndSameMinorVersion.isCompatible(targetVersion), true)

    const sameMajorAndLowerMinorVersion = new HWPVersion(5, 1, 2, 4)
    assert.strictEqual(sameMajorAndLowerMinorVersion.isCompatible(targetVersion), true)

    const lowerMajorVersion = new HWPVersion(3, 0, 0, 0)
    assert.strictEqual(lowerMajorVersion.isCompatible(targetVersion), false)
  })

  it('should return correct greater than or equal to version', () => {
    const targetVersion = new HWPVersion(5, 7, 3, 2)

    const higerMajorVersion = new HWPVersion(6, 5, 2, 1)
    assert.strictEqual(higerMajorVersion.gte(targetVersion), true)

    const lowerMajorVersion = new HWPVersion(4, 7, 3, 2)
    assert.strictEqual(lowerMajorVersion.gte(targetVersion), false)

    const higerMinorVersion = new HWPVersion(5, 8, 2, 1)
    assert.strictEqual(higerMinorVersion.gte(targetVersion), true)

    const lowerMinorVersion = new HWPVersion(5, 6, 2, 1)
    assert.strictEqual(lowerMinorVersion.gte(targetVersion), false)

    const higerBuildVersion = new HWPVersion(5, 7, 4, 1)
    assert.strictEqual(higerBuildVersion.gte(targetVersion), true)

    const lowerBuildVersion = new HWPVersion(5, 7, 2, 4)
    assert.strictEqual(lowerBuildVersion.gte(targetVersion), false)

    const higerRevisionVersion = new HWPVersion(5, 7, 3, 6)
    assert.strictEqual(higerRevisionVersion.gte(targetVersion), true)

    const lowerRevisionVersion = new HWPVersion(5, 7, 3, 1)
    assert.strictEqual(lowerRevisionVersion.gte(targetVersion), false)

    const sameVersion = new HWPVersion(5, 7, 3, 2)
    assert.strictEqual(sameVersion.gte(targetVersion), true)
  })
})
