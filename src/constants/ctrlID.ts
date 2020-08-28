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

export function makeCtrlID(
  first: string,
  second: string,
  third: string,
  fourth: string,
): number {
  const firstCode = first.charCodeAt(0)
  const secondCode = second.charCodeAt(0)
  const thirdCode = third.charCodeAt(0)
  const fourthCode = fourth.charCodeAt(0)
  return ((firstCode) << 24) | ((secondCode) << 16) | ((thirdCode) << 8) | (fourthCode)
}

export enum CommonCtrlID {
  Table = makeCtrlID('t', 'b', 'l', ' '),
}
