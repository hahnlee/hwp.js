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

/**
 * @see https://github.com/hahnlee/hwp.js/blob/master/docs/hwp/5.0/FileHeader.md#%ED%8C%8C%EC%9D%BC-%EB%B2%84%EC%A0%84
 */
class HWPVersion {
  major: number

  minor: number

  build: number

  revision: number

  constructor(major: number, minor: number, build: number, revision: number) {
    this.major = major
    this.minor = minor
    this.build = build
    this.revision = revision
  }

  isCompatible(target: HWPVersion): boolean {
    return this.major === target.major && this.minor <= target.minor
  }

  gte(target: HWPVersion): boolean {
    if (this.major > target.major) {
      return true
    }

    if (this.major < target.major) {
      return false
    }

    if (this.minor > target.minor) {
      return true
    }

    if (this.minor < target.minor) {
      return false
    }

    if (this.build > target.build) {
      return true
    }

    if (this.build < target.build) {
      return false
    }

    if (this.revision >= target.revision) {
      return true
    }

    return false
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.build}.${this.revision}`
  }

  toJSON(): string {
    return this.toString()
  }
}

export default HWPVersion
