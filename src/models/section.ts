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

import Paragraph from './paragraph'

class Section {
  width: number = 0

  height: number = 0

  paddingLeft: number = 0

  paddingRight: number = 0

  paddingTop: number = 0

  paddingBottom: number = 0

  headerPadding: number = 0

  footerPadding: number = 0

  content: Paragraph[] = []

  orientation: number = 0

  bookBindingMethod: number = 0
}

export default Section
