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

import DocInfo from '../models/docInfo'
import HWPDocument from '../models/document'
import HWPHeader from '../models/header'
import HWPVersion from '../models/version'
import Section from '../models/section'
import parse from '../parser'

class HWPViewer {
  private hwpDocument: HWPDocument = new HWPDocument(
    new HWPHeader(new HWPVersion(5, 0, 0, 0)),
    new DocInfo(),
    [],
  )

  private container: HTMLElement

  private viewer: HTMLElement = window.document.createElement('div')

  constructor(container: HTMLElement, file: File) {
    this.container = container

    const reader = new FileReader()

    reader.onload = (result) => {
      const bstr = result.target?.result

      if (bstr) {
        this.hwpDocument = parse(bstr as Uint8Array, { type: 'binary' })
        this.draw()
      }
    }

    reader.readAsBinaryString(file)
  }

  private drawPageContainer = (section: Section) => {
    const page = document.createElement('div')

    page.style.boxShadow = '0 1px 3px 1px rgba(60,64,67,.15)'
    page.style.backgroundColor = '#FFF'
    page.style.margin = '0 auto'

    page.style.width = `${section.width / 7200}in`
    page.style.height = `${section.height / 7200}in`
    page.style.paddingTop = `${section.paddingTop / 7200}in`
    page.style.paddingRight = `${section.paddingRight / 7200}in`
    page.style.paddingBottom = `${section.paddingBottom / 7200}in`
    page.style.paddingLeft = `${section.paddingLeft / 7200}in`

    this.viewer.appendChild(page)
  }

  private drawViewer() {
    this.viewer.style.backgroundColor = '#E8EAED'
    this.viewer.style.padding = '24px'
  }

  private draw() {
    this.drawViewer()

    this.hwpDocument.sections.forEach(this.drawPageContainer)

    this.container.appendChild(this.viewer)
  }
}

export default HWPViewer
