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

import { DocInfoTagID } from '../../constants/tag-id.js'
import type { HWPRecord } from '../record.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ChangeTracking {
  static fromRecord(record: HWPRecord) {
    if (record.id !== DocInfoTagID.HWPTAG_TRACK_CHANGE) {
      throw new Error('DocInfo: ChangeTracking: Record has wrong ID')
    }

    // TODO: implement

    return new ChangeTracking()
  }
}