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

export enum BinDataType {
  LINK,
  EMBEDDING,
  STORAGE,
}

export enum BinDataCompress {
  DEFAULT,
  COMPRESS,
  NOT_COMPRESS,
}

export enum BinDataStatus {
  INITIAL,
  SUCCESS,
  ERROR,
  IGNORE,
}

interface BinProperties {
  type: BinDataType
  compress: BinDataCompress
  status: BinDataStatus
}

class BinData {
  properties: BinProperties

  extension: string

  payload: Uint8Array

  constructor(properties: BinProperties, extension: string, payload: Uint8Array) {
    this.properties = properties
    this.extension = extension
    this.payload = payload
  }
}

export default BinData
