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

import HWPDocument from '../models/document'
import Section from '../models/section'
import PageBuilder from './PageBuilder'

function parsePage(doc: HWPDocument): HWPDocument {
  let sections: Section[] = []

  doc.sections.forEach((section) => {
    sections = sections.concat(new PageBuilder(section).build())
  })

  doc.sections = sections
  return doc
}

export default parsePage
