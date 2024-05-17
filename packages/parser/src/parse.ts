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

import { HWPDocument } from './models/document.js'
import type { ParseOptions } from './types/parser.js'

export function parse(
  buffer: Uint8Array | ArrayBuffer,
  { strict = true }: Partial<ParseOptions> = {},
): HWPDocument {
  return HWPDocument.fromBytes(convertTypedArray(buffer), {
    strict,
  })
}

function convertTypedArray(data: Uint8Array | ArrayBuffer): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  }
  return data
}
