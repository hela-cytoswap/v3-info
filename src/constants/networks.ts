import { ChainId } from '@cytoswap/sdk-core'
import HELA_LOGO_URL from '../assets/images/hela.png'

export enum SupportedNetwork {
  HELA,
}

export type NetworkInfo = {
  chainId: ChainId
  id: SupportedNetwork
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
}

export const HeLaNetworkInfo: NetworkInfo = {
  chainId: ChainId.HELA,
  id: SupportedNetwork.HELA,
  route: '',
  name: 'HeLa',
  bgColor: '#02502F',
  primaryColor: '#35D07F',
  secondaryColor: '#9ACDB2',
  imageURL: HELA_LOGO_URL,
}

export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = [HeLaNetworkInfo]
