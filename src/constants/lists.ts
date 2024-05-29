// used to mark unsupported tokens, these are hosted lists of unsupported tokens

export const UNSUPPORTED_LIST_URLS: string[] = []
export const HELA_LIST = process.env.REACT_APP_TOKEN_LISTS!

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  HELA_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [HELA_LIST]
