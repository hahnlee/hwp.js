const supportedLanguages = ['ko', 'en-US']
const defaultLanguage = 'en-US'

import {default as Korean} from "./translation/ko.json"
import {default as English} from "./translation/english.json"

const strings = {
  "ko": Korean,
  "en-US": English
} as any

export default function loadString(key: string) {
  let language = window.navigator.language
  if (!supportedLanguages.includes(language)) language = defaultLanguage
  return strings[language][key]
}
