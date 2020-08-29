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

export function makeCtrlID(
  first: string,
  second: string,
  third: string,
  fourth: string,
): number {
  const firstCode = first.charCodeAt(0)
  const secondCode = second.charCodeAt(0)
  const thirdCode = third.charCodeAt(0)
  const fourthCode = fourth.charCodeAt(0)
  return ((firstCode) << 24) | ((secondCode) << 16) | ((thirdCode) << 8) | (fourthCode)
}

export enum CommonCtrlID {
  Table = makeCtrlID('t', 'b', 'l', ' '),
  Line = makeCtrlID('$', 'l', 'i', 'n'),
  Rectangle = makeCtrlID('$', 'r', 'e', 'c'),
  Ellipse = makeCtrlID('$', 'e', 'l', 'l'),
  Arc = makeCtrlID('$', 'a', 'r', 'c'),
  Polygon = makeCtrlID('$', 'p', 'o', 'l'),
  Curve = makeCtrlID('$', 'c', 'u', 'r'),
  Equation = makeCtrlID('e', 'q', 'e', 'd'),
  Picture = makeCtrlID('$', 'p', 'i', 'c'),
  OLE = makeCtrlID('$', 'o', 'l', 'e'),
  Connected = makeCtrlID('$', 'c', 'o', 'n'),

  // NOTE: (@hahnlee) 공개된 문서에서 자세히 설명되어 있지는 않으나, 개채요소 설명에 따라 GenShapeObject로 추측됨
  GenShapeObject = makeCtrlID('g', 's', 'o', ' ')
}

export enum OtherCtrlID {
  Section = makeCtrlID('s', 'e', 'c', 'd'),
  Column = makeCtrlID('c', 'o', 'l', 'd'),
  Header = makeCtrlID('h', 'e', 'a', 'd'),
  Footer = makeCtrlID('f', 'o', 'o', 't'),
  Footnote = makeCtrlID('f', 'n', ' ', ' '),
  Endnote = makeCtrlID('e', 'n', ' ', ' '),
  AutoNumber = makeCtrlID('a', 't', 'n', 'o'),
  NewNumber = makeCtrlID('n', 'w', 'n', 'o'),
  PageHide = makeCtrlID('p', 'g', 'h', 'd'),
  // TODO: (@hahnlee) 홀/짝수 조정 적절한 용어찾기
  PageCT = makeCtrlID('p', 'g', 'c', 't'),
  PageNumberPosition = makeCtrlID('p', 'g', 'n', 'p'),
  Indexmark = makeCtrlID('i', 'd', 'x', 'm'),
  Bookmark = makeCtrlID('b', 'o', 'k', 'm'),
  Overlapping = makeCtrlID('t', 'c', 'p', 's'),
  Comment = makeCtrlID('t', 'd', 'u', 't'),
  HiddenComment = makeCtrlID('t', 'c', 'm', 't'),
}

export enum FieldCtrlID {
  Unknown = makeCtrlID('%', 'u', 'n', 'k'),
  Date = makeCtrlID('$', 'd', 't', 'e'),
  DocDate = makeCtrlID('%', 'd', 'd', 't'),
  Path = makeCtrlID('%', 'p', 'a', 't'),
  Bookmark = makeCtrlID('%', 'b', 'm', 'k'),
  MailMerge = makeCtrlID('%', 'm', 'm', 'g'),
  CrossRef = makeCtrlID('%', 'x', 'r', 'f'),
  Formula = makeCtrlID('%', 'f', 'm', 'u'),
  ClickHere = makeCtrlID('%', 'c', 'l', 'k'),
  Summary = makeCtrlID('$', 's', 'm', 'r'),
  UserInfo = makeCtrlID('%', 'u', 's', 'r'),
  HyperLink = makeCtrlID('%', 'h', 'l', 'k'),
  RevisionSign = makeCtrlID('%', 's', 'i', 'g'),
  RevisionDelete = makeCtrlID('%', '%', '*', 'd'),
  RevisionAttach = makeCtrlID('%', '%', '*', 'a'),
  RevisionClipping = makeCtrlID('%', '%', '*', 'C'),
  RevisionSawtooth = makeCtrlID('%', '%', '*', 'S'),
  RevisionThinking = makeCtrlID('%', '%', '*', 'T'),
  RevisionPraise = makeCtrlID('%', '%', '*', 'P'),
  RevisionLine = makeCtrlID('%', '%', '*', 'L'),
  RevisionSimpleChange = makeCtrlID('%', '%', '*', 'c'),
  RevisionHyperLink = makeCtrlID('%', '%', '*', 'h'),
  RevisionLineAttach = makeCtrlID('%', '%', '*', 'A'),
  RevisionLineLink = makeCtrlID('%', '%', '*', 'i'),
  RevisionLineRansfer = makeCtrlID('%', '%', '*', 't'),
  RevisionRightMove = makeCtrlID('%', '%', '*', 'r'),
  RevisionLeftMove = makeCtrlID('%', '%', '*', 'l'),
  RevisionTransfer = makeCtrlID('%', '%', '*', 'n'),
  RevisionSimpleInsert = makeCtrlID('%', '%', '*', 'e'),
  RevisionSplit = makeCtrlID('%', 's', 'p', 'l'),
  RevisionChange = makeCtrlID('%', '%', 'm', 'r'),
  Memo = makeCtrlID('%', '%', 'm', 'e'),
  PrivateInfoSecurity = makeCtrlID('%', 'c', 'p', 'r'),
  TableOfContents = makeCtrlID('%', 't', 'o', 'c'),
}
