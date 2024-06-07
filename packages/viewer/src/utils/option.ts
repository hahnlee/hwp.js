import { CFB$ParsingOptions } from "cfb/types"

export interface viewerOption {
  parser?: CFB$ParsingOptions;
  utility?: {
    print?: boolean;
    presentation?: boolean;
  }
}

export const defaultOption: viewerOption = {
  parser: {
    type: 'binary'
  },
  utility: {
    print: true,
    presentation: true
  }
}

export function formatOption(option: viewerOption) {
  return Object.assign(defaultOption, option)
}
