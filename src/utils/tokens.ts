import { Token } from '@cytoswap/sdk-core'
import { NetworkInfo } from 'constants/networks'
import { WHLUSD_ADDRESS } from '../constants'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function formatTokenSymbol(address: string, symbol: string, activeNetwork?: NetworkInfo) {
  if (address.toLowerCase() === WHLUSD_ADDRESS.toLowerCase()) {
    return 'HLUSD';
  }

  return symbol
}

export function formatTokenName(address: string, name: string, activeNetwork?: NetworkInfo) {
  if (address.toLowerCase() === WHLUSD_ADDRESS.toLowerCase()) {
    return 'HLUSD';
  }

  return name
}
