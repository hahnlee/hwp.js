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

import React, { useState, useCallback, useEffect, useRef } from 'react'

import HWPViewer from '../../../src/viewer'

function IndexPage() {
  const [file, setFile] = useState<File | null>(null)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const viewerRef = useRef<HWPViewer | null>(null)

  const handleChange = useCallback((e) => {
    setFile(e.target.files[0])
  }, [])

  useEffect(() => {
    if (!ref || !file) {
      return
    }

    const reader = new FileReader()

    reader.onload = (result) => {
      const bstr = result.target?.result

      if (bstr) {
        viewerRef.current = new HWPViewer(ref, bstr as Uint8Array)
      }
    }

    reader.readAsBinaryString(file)

    return () => {
      viewerRef.current?.distory()
    }
  }, [ref, file])

  return (
    <div>
      { !file && <input type="file" onChange={handleChange} /> }
      <div className="container" ref={setRef} />
      <style>
        { `
          * {
            box-sizing: border-box;
          }

          html, body {
            padding: 0;
            margin: 0;
          }

          .container {
            height: 100vh;
          }
        ` }
      </style>
    </div>
  )
}

export default IndexPage
