/**
 * Copyright 2020-Present Han Lee <hanlee.dev@gmail.com>, Seo-Rii <studioSeoRii@gmail.com>,
 * 2019 András Szepesházi
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

/*
 * LICENSE FOR https://github.com/szepeshazi/print-elements
 *
 * MIT License
 *
 * Copyright (c) 2019 András Szepesházi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const hideFromPrintClass = 'pe-no-print'
const preservePrintClass = 'pe-preserve-print'
const preserveAncestorClass = 'pe-preserve-ancestor'
const bodyElementName = 'BODY'

function walkTree(
  element: HTMLElement,
  callback: (element: HTMLElement, isStartingElement: boolean) => void,
) {
  let currentElement: HTMLElement | null = element
  callback(currentElement, true)
  currentElement = currentElement.parentElement
  while (currentElement && currentElement.nodeName !== bodyElementName) {
    callback(currentElement, false)
    currentElement = currentElement.parentElement
  }
}

function walkSiblings(
  element: HTMLElement,
  callback: (element: HTMLElement | Element, isStartingElement: boolean) => void,
) {
  let sibling: Element | null = element.previousElementSibling
  while (sibling) {
    callback(sibling, false)
    sibling = sibling.previousElementSibling
  }
  sibling = element.nextElementSibling
  while (sibling) {
    callback(sibling, false)
    sibling = sibling.nextElementSibling
  }
}

export default function printFrame(elements: HTMLElement[]) {
  const printStyle: string = `
    @page {
      margin: 0;
    }

    @media print {
      html, body {
        width: 100%;
        height: 100%;
        background-color: #FFF;
      }

      .${hideFromPrintClass} {
        display: none !important;
      }

      .${preserveAncestorClass} {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .${preserveAncestorClass} > *  {
        box-shadow: none !important;
        overflow: visible !important;
      }

      .${preservePrintClass} {
        box-shadow: none !important;
        height: 100% !important;
        margin: 0 !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `
  const styleSheet: HTMLStyleElement = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = printStyle
  document.head.appendChild(styleSheet)

  const hide = (element: HTMLElement | Element) => {
    if (!element.classList.contains(preservePrintClass)) {
      element.classList.add(hideFromPrintClass)
    }
  }

  const preserve = (element: HTMLElement | Element, isStartingElement: boolean) => {
    element.classList.remove(hideFromPrintClass)
    element.classList.add(preservePrintClass)
    if (!isStartingElement) {
      element.classList.add(preserveAncestorClass)
    }
  }

  const clean = (element: HTMLElement | Element) => {
    element.classList.remove(hideFromPrintClass)
    element.classList.remove(preservePrintClass)
    element.classList.remove(preserveAncestorClass)
  }

  elements.forEach((i: HTMLElement) => {
    walkTree(i, (element: HTMLElement, isStartingElement: boolean) => {
      preserve(element, isStartingElement)
      walkSiblings(element, hide)
    })
  })

  window.print()

  elements.forEach((i: HTMLElement) => {
    walkTree(i, (element: HTMLElement) => {
      clean(element)
      walkSiblings(element, clean)
    })
  })

  styleSheet.remove()
}
