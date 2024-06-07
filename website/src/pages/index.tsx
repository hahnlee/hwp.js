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
import HWPViewer from '@hwp.js/viewer'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import Loader from 'react-loader-spinner'

import Page from '../components/Page'

function IndexPage() {
  const viewerRef = useRef<HTMLDivElement | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadSampleHWP = useCallback(() => {
    setIsLoading(true)
    setHasError(false)

    fetch('files/noori.hwp')
      .then(res => res.arrayBuffer())
      .then(res => {
        const array = new Uint8Array(res)
        setIsLoading(false)
        new HWPViewer(viewerRef.current, array, { parser: { type: 'array' }})
      })
      .catch(() => {
        setIsLoading(false)
        setHasError(true)
      })
  }, [])

  useEffect(() => {
    loadSampleHWP()
  }, [])

  return (
    <Page title="hwp.js">
      <main className="index">
        <section className="main">
          <img src="images/logo.svg" />
          <p>Open source hwp viewer and parser library powered by web technology</p>
          <a type="button" className="btn btn-default" href="https://github.com/hahnlee/hwp.js">GitHub</a>
          <a type="button" className="btn btn-default" href="https://chrome.google.com/webstore/detail/hwpjs/hgalnnpknkjdccmcljadkckcdibiglei">
            Chrome extension
          </a>
          <a type="button" className="btn btn-default" href="https://github.com/hahnlee/hwp.js/issues/7">공지사항</a>
          <a type="button" className="btn btn-default" href="demo">Demo</a>
          <pre className="code">
            <code>
              npm install hwp.js
              <br />
              yarn add hwp.js
            </code>
          </pre>
        </section>
        <div className="container" ref={viewerRef}>
          {
            isLoading && (
              <div className="notice">
                <Loader
                  type="Oval"
                  color="#00BFFF"
                  height={100}
                  width={100}
                />
              </div>
            )
          }
          {
            hasError && (
              <div className="notice">
                <h1>에러가 발생했습니다 :(</h1>
                <button className="btn btn-default" onClick={loadSampleHWP}>다시시도 하기</button>
              </div>
            )
          }
        </div>
      </main>
    </Page>
  )
}

export default IndexPage
