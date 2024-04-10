/**
 * Copyright Han Lee <hanlee.dev@gmail.com> and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
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

import { find, type CFB$Container } from 'cfb'

import { HWPVersion } from './version.js'
import { ByteReader } from '../utils/byte-reader.js'
import { getBitValue } from '../utils/bit-utils.js'

const SIGNATURE = 'HWP Document File'
const FILE_HEADER_BYTES = 256

export class HWPHeader {
  constructor(
    public version: HWPVersion,
    public flags: Flags,
    public license: License,
    public encryptVersion: EncryptVersion,
    public kogl: KOGL,
    public reserved: ArrayBuffer
  ) {}

  static fromCfbContainer(container: CFB$Container): HWPHeader {
    const fileHeader = find(container, 'FileHeader')

    if (!fileHeader) {
      throw new Error('Cannot find FileHeader')
    }

    const reader = new ByteReader(Uint8Array.from(fileHeader.content).buffer)
    return HWPHeader.fromByteReader(reader)
  }

  static fromByteReader(reader: ByteReader): HWPHeader {
    if (reader.length() !== FILE_HEADER_BYTES) {
      throw new Error(
        `FileHeader must be ${FILE_HEADER_BYTES} bytes, Received: ${reader.length()}`
      )
    }

    const signature = new TextDecoder().decode(reader.read(17))
    if (signature !== SIGNATURE) {
      throw new Error(
        `hwp file's signature should be ${SIGNATURE}. Received version: ${signature}`
      )
    }

    // Reserved
    reader.read(15)

    const revision = reader.readUInt8()
    const build = reader.readUInt8()
    const minor = reader.readUInt8()
    const major = reader.readUInt8()
    const version = new HWPVersion(major, minor, build, revision)

    const flags = Flags.fromBits(reader.readUInt32())
    const license = License.fromBits(reader.readUInt32())
    const encryptVersion = mapEncryptVersion(reader.readInt32())
    const kogl = mapKogl(reader.readUInt8())
    const reserved = reader.read(207)

    if (!reader.isEOF()) {
      throw new Error('FileHeader is not EOF')
    }

    return new HWPHeader(
      version,
      flags,
      license,
      encryptVersion,
      kogl,
      reserved
    )
  }
}

export class Flags {
  constructor(
    /** 압축 여부 */
    public compressed: boolean,
    /** 암호 설정 여부 */
    public encrypted: boolean,
    /** 배포용 문서 여부 */
    public distributed: boolean,
    /** 스크립트 저장 여부 */
    public script: boolean,
    /** DRM 보안 문서 여부 */
    public drm: boolean,
    /** XMLTemplate 스토리지 존재 여부 */
    public xmlTemplateStorage: boolean,
    /** 문서 이력 관리 존재 여부 */
    public vcs: boolean,
    /** 전자 서명 정보 존재 여부 */
    public electronicSignatured: boolean,
    /** 공인 인증서 암호화 여부 */
    public certificateEncrypted: boolean,
    /** 전자 서명 예비 저장 여부 */
    public prepareSignatured: boolean,
    /** 공인 인증서 DRM 보안 문서 여부 */
    public certificateDrm: boolean,
    /** CCL 문서 여부 */
    public ccl: boolean,
    /** 모바일 최적화 여부 */
    public mobileOptimized: boolean,
    /** 개인 정보 보안 문서 여부 */
    public privacySecurityDocument: boolean,
    /** 변경 추적 문서 여부 */
    public trackChanges: boolean,
    /** 공공누리(KOGL) 저작권 문서 */
    public kogl: boolean,
    /** 비디오 컨트롤 포함 여부 */
    public videoControl: boolean,
    /** 차례 필드 컨트롤 포함 여부 */
    public orderFieldControl: boolean
  ) {}

  static fromBits(bits: number): Flags {
    return new Flags(
      Boolean(getBitValue(bits, 0)),
      Boolean(getBitValue(bits, 1)),
      Boolean(getBitValue(bits, 2)),
      Boolean(getBitValue(bits, 3)),
      Boolean(getBitValue(bits, 4)),
      Boolean(getBitValue(bits, 5)),
      Boolean(getBitValue(bits, 6)),
      Boolean(getBitValue(bits, 7)),
      Boolean(getBitValue(bits, 8)),
      Boolean(getBitValue(bits, 9)),
      Boolean(getBitValue(bits, 10)),
      Boolean(getBitValue(bits, 11)),
      Boolean(getBitValue(bits, 12)),
      Boolean(getBitValue(bits, 13)),
      Boolean(getBitValue(bits, 14)),
      Boolean(getBitValue(bits, 15)),
      Boolean(getBitValue(bits, 16)),
      Boolean(getBitValue(bits, 17))
    )
  }
}

export class License {
  constructor(
    public ccl: boolean,
    public replicationRestrictions: boolean,
    public replicationAlike: boolean,
    public reserved: number
  ) {}

  static fromBits(bits: number): License {
    return new License(
      Boolean(getBitValue(bits, 0)),
      Boolean(getBitValue(bits, 1)),
      Boolean(getBitValue(bits, 2)),
      getBitValue(bits, 3, 32)
    )
  }
}

export enum EncryptVersion {
  None,
  /** 한/글 2.5 버전 이하 */
  HWP2_5,
  /** 한/글 3.0 버전 Enhanced */
  HWP3Enhanced,
  /** 한/글 3.0 버전 Old */
  HWP3Old,
  /** 한/글 7.0 버전 이후 */
  HWP7,
}

function mapEncryptVersion(byte: number): EncryptVersion {
  switch (byte) {
    case 0:
      return EncryptVersion.None
    case 1:
      return EncryptVersion.HWP2_5
    case 2:
      return EncryptVersion.HWP3Enhanced
    case 3:
      return EncryptVersion.HWP3Old
    case 4:
      return EncryptVersion.HWP7
    default:
      throw new Error(`Unknown encrypt version: ${byte}`)
  }
}

export enum KOGL {
  None,
  KOR = 6,
  US = 15,
}

function mapKogl(byte: number): KOGL {
  switch (byte) {
    case 0:
      return KOGL.None
    case 6:
      return KOGL.KOR
    case 15:
      return KOGL.US
    default:
      throw new Error(`Unknown KOGL: ${byte}`)
  }
}
