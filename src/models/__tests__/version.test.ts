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

import HWPVersion from '../version'

describe('HWPVersion', () => {
  it('should make correct version string', () => {
    const testVersion = new HWPVersion(5, 0, 3, 1)
    expect(`${testVersion}`).toEqual('5.0.3.1')
  })

  it('should return version string', () => {
    const testVersion = new HWPVersion(5, 0, 3, 1)
    expect(JSON.stringify(testVersion)).toEqual(JSON.stringify('5.0.3.1'))
  })

  it('should return correct compatible', () => {
    const targetVersion = new HWPVersion(5, 3, 0, 0)

    const highMajorVersion = new HWPVersion(6, 0, 1, 2)
    expect(highMajorVersion.isCompatible(targetVersion)).toEqual(false)

    const sameMajorAndHigerMinorVersion = new HWPVersion(5, 4, 1, 7)
    expect(sameMajorAndHigerMinorVersion.isCompatible(targetVersion)).toEqual(false)

    const sameMajorAndSameMinorVersion = new HWPVersion(5, 3, 1, 7)
    expect(sameMajorAndSameMinorVersion.isCompatible(targetVersion)).toEqual(true)

    const sameMajorAndLowerMinorVersion = new HWPVersion(5, 1, 2, 4)
    expect(sameMajorAndLowerMinorVersion.isCompatible(targetVersion)).toEqual(true)

    const lowerMajorVersion = new HWPVersion(3, 0, 0, 0)
    expect(lowerMajorVersion.isCompatible(targetVersion)).toEqual(false)
  })

  it('should return correct greater than or equal to version', () => {
    const targetVersion = new HWPVersion(5, 7, 3, 2)

    const higerMajorVersion = new HWPVersion(6, 5, 2, 1)
    expect(higerMajorVersion.gte(targetVersion)).toEqual(true)

    const lowerMajorVersion = new HWPVersion(4, 7, 3, 2)
    expect(lowerMajorVersion.gte(targetVersion)).toEqual(false)

    const higerMinorVersion = new HWPVersion(5, 8, 2, 1)
    expect(higerMinorVersion.gte(targetVersion)).toEqual(true)

    const lowerMinorVersion = new HWPVersion(5, 6, 2, 1)
    expect(lowerMinorVersion.gte(targetVersion)).toEqual(false)

    const higerBuildVersion = new HWPVersion(5, 7, 4, 1)
    expect(higerBuildVersion.gte(targetVersion)).toEqual(true)

    const lowerBuildVersion = new HWPVersion(5, 7, 2, 4)
    expect(lowerBuildVersion.gte(targetVersion)).toEqual(false)

    const higerRevisionVersion = new HWPVersion(5, 7, 3, 6)
    expect(higerRevisionVersion.gte(targetVersion)).toEqual(true)

    const lowerRevisionVersion = new HWPVersion(5, 7, 3, 1)
    expect(lowerRevisionVersion.gte(targetVersion)).toEqual(false)

    const sameVersion = new HWPVersion(5, 7, 3, 2)
    expect(sameVersion.gte(targetVersion)).toEqual(true)
  })
})
