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

export declare class ResizeObserver {
  constructor(e: () => void)
  observe(target: Element): void
  unobserve(target: Element): void
}

export default function startPresentation(container: HTMLElement, header: HTMLElement,
                                          elements: HTMLElement[], initPage: number) {
  let currentPage = initPage

  const documentContainer = container.children[0] as HTMLElement
  const pageContainer = elements[currentPage - 1].parentElement as HTMLElement
  const headerContainer = header.parentElement as HTMLElement
  let originalScaleFactor = pageContainer.offsetHeight / elements[0].offsetHeight

  const originalBackground = documentContainer.style.backgroundColor
  const originalHeaderDisplay = headerContainer.style.display
  const originalPageContainerMarginTop = pageContainer.style.marginTop
  const originalPageContainerDisplay = pageContainer.style.display
  const originalPageContainerAlignItems = pageContainer.style.alignItems
  const originalPageDisplay = elements[currentPage - 1].style.display
  const originalPageTransform = elements[currentPage - 1].style.display
  const originalScrollTop = pageContainer.scrollTop

  const resizeObserver = new ResizeObserver(() => {
    const newScaleFactor = pageContainer.offsetHeight / elements[currentPage - 1].offsetHeight
    if (originalScaleFactor !== newScaleFactor) {
      originalScaleFactor = newScaleFactor
      elements.forEach((i: HTMLElement) => {
        i.style.transform = `scale(${newScaleFactor})`
      })
    }
  })
  resizeObserver.observe(pageContainer)

  documentContainer.style.backgroundColor = 'rgb(0, 0, 0)'
  headerContainer.style.display = 'none'
  pageContainer.style.marginTop = '0'
  pageContainer.style.display = 'flex'
  pageContainer.style.alignItems = 'center'

  elements.forEach((i: HTMLElement) => {
    i.style.display = 'none'
  })

  elements[currentPage - 1].style.display = ''

  const validatePage = () => {
    if (currentPage < 1) currentPage = 1
    if (currentPage > elements.length) {
      document.exitFullscreen().then()
      return true
    }
    return false
  }

  const scrollHandler = (e: WheelEvent) => {
    const lastPage = currentPage
    if (e.deltaY <= 0) {
      currentPage -= 1
      if (validatePage()) return
    } else {
      currentPage += 1
      if (validatePage()) return
    }
    elements[lastPage - 1].style.display = 'none'
    elements[currentPage - 1].style.display = ''
  }

  const clickHandler = () => {
    const lastPage = currentPage
    currentPage += 1
    if (validatePage()) return
    elements[lastPage - 1].style.display = 'none'
    elements[currentPage - 1].style.display = ''
  }

  const exitFullScreenHandler = () => {
    if (!document.fullscreenElement) {
      document.removeEventListener('fullscreenchange', exitFullScreenHandler)
      resizeObserver.unobserve(pageContainer)
      pageContainer.removeEventListener('click', clickHandler)
      pageContainer.removeEventListener('mousewheel', scrollHandler as (e: Event) => void)

      documentContainer.style.backgroundColor = originalBackground
      headerContainer.style.display = originalHeaderDisplay
      pageContainer.style.marginTop = originalPageContainerMarginTop
      pageContainer.style.display = originalPageContainerDisplay
      pageContainer.style.alignItems = originalPageContainerAlignItems
      elements.forEach((i: HTMLElement) => {
        i.style.transform = originalPageTransform
        i.style.display = originalPageDisplay
      })
      pageContainer.scrollTop = originalScrollTop
    }
  }

  pageContainer.addEventListener('mousewheel', scrollHandler as (e: Event) => void)
  pageContainer.addEventListener('click', clickHandler)

  document.addEventListener('fullscreenchange', exitFullScreenHandler)

  container.requestFullscreen().catch()
}
