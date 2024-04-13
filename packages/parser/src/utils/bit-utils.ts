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

export function getBitValue(mask: number, start: number, end: number = start): number {
  const target: number = mask >> start

  let temp = 0
  for (let index = 0; index <= (end - start); index += 1) {
    temp <<= 1
    temp += 1
  }

  return target & temp
}

export function getFlag(bits: number, position: number): boolean {
  const mask: number = 1 << position
  return (bits & mask) === mask
}
