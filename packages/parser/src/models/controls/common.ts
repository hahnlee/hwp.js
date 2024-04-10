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

import CommonAttribute from './commonAttribute.js'
import { BaseControl } from './base.js'

class CommonControl implements BaseControl {
  id: number = 0

  attribute = new CommonAttribute()

  verticalOffset: number = 0

  horizontalOffset: number = 0

  width: number = 0

  height: number = 0

  zIndex: number = 0

  margin: [number, number, number, number] = [0, 0, 0, 0]

  uid: number = 0

  split: number = 0
}

export default CommonControl
