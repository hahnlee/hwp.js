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

import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

import HWPViewer from '../../../src/viewer'
import Page from '../components/Page'

function Demo() {
  const ref = useRef<HTMLDivElement | null>(null)

  const [isFileUploaded, setFileUploaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const showViewer = useCallback((file: File) => {
    const reader = new FileReader()

    reader.onload = (result) => {
      const bstr = result.target?.result

      if (bstr) {
        try {
          new HWPViewer(ref.current, bstr as Uint8Array)
        } catch (e) {
          setErrorMessage(e.message)
        }
      }
    }

    reader.readAsBinaryString(file)
  }, [])

  const onDrop = useCallback((files: File[]) => {
    setFileUploaded(true)

    const file = files.shift()
    showViewer(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/haansofthwp',
  })

  return (
    <Page title="Demo - hwp.js">
      <div className="viewer" ref={ref}>
        {
          !isFileUploaded && (
            <div className="dnd" {...getRootProps()}>
              <input {...getInputProps()} />
              { !isDragActive && (
                <h1>
                  hwp 파일을 드래그 & 드랍해 주세요
                </h1>
              ) }
            </div>
          )
        }
        {
          errorMessage && (
            <div>
              <h1>에러가 발생했습니다</h1>
              <p>{ errorMessage }</p>
            </div>
          )
        }
      </div>
    </Page>
  )
}

export default Demo
