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

import { HWPVersion } from './version.js'

interface Properties {
  /** 압축 여부 */
  compressed: boolean

  /** 암호 설정 여부 */
  encrypted: boolean

  /** 배포용 문서 여부 */
  distribution: boolean

  /** 스크립트 저장 여부 */
  script: boolean

  /** DRM 보안 문서 여부 */
  drm: boolean

  /** XMLTemplate 스토리지 존재 여부 */
  hasXmlTemplateStorage: boolean

  /** 문서 이력 관리 존재 여부 */
  vcs: boolean

  /** 전자 서명 정보 존재 여부 */
  hasElectronicSignatureInfomation: boolean

  /** 공인 인증서 암호화 여부 */
  certificateEncryption: boolean

  /** 전자 서명 예비 저장 여부 */
  prepareSignature: boolean

  /** 공인 인증서 DRM 보안 문서 여부 */
  certificateDRM: boolean

  /** CCL 문서 여부 */
  ccl: boolean

  /** 모바일 최적화 여부 */
  mobile: boolean

  /** 개인 정보 보안 문서 여부 */
  isPrivacySecurityDocument: boolean

  /** 변경 추적 문서 여부 */
  trackChanges: boolean

  /** 공공누리(KOGL) 저작권 문서 */
  kogl: boolean

  /** 비디오 컨트롤 포함 여부 */
  hasVideoControl: boolean

  /** 차례 필드 컨트롤 포함 여부 */
  hasOrderFieldControl: boolean
}

/**
 * @see https://github.com/hahnlee/hwp.js/blob/master/docs/hwp/5.0/FileHeader.md
 */
export class HWPHeader {
  version: HWPVersion

  signature: string

  properties: Properties

  constructor(version: HWPVersion, signature: string, properties: Properties) {
    this.version = version
    this.signature = signature
    this.properties = properties
  }
}
