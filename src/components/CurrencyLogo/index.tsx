import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from '../Logo'
import { useCombinedActiveList } from 'state/lists/hooks'
import useHttpLocations from 'hooks/useHttpLocations'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { ChainId } from '@cytoswap/sdk-core'

export function chainIdToNetworkName(networkId: ChainId) {
  switch (networkId) {
    case ChainId.MAINNET:
      return 'ethereum'
    case ChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case ChainId.OPTIMISM:
      return 'optimism'
    case ChainId.POLYGON:
      return 'polygon'
    case ChainId.BNB:
      return 'smartchain'
    case ChainId.BASE:
      return 'base'
    case ChainId.HELA:
      return 'hela'
    default:
      return 'ethereum'
  }
}

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.text4};
`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function CurrencyLogo({
  address,
  size = '24px',
  style,
  ...rest
}: {
  address?: string
  size?: string
  style?: React.CSSProperties
}) {
  // useOptimismList()
  const helaList = useCombinedActiveList()?.[ChainId.HELA]
  console.log('helaList', helaList)

  const [activeNetwork] = useActiveNetworkVersion()

  const checkSummed = isAddress(address)

  const helaURI = useMemo(() => {
    if (checkSummed && helaList?.[checkSummed]) {
      return helaList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, helaList])
  const uriLocationsHeLa = useHttpLocations(helaURI)
  

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed && address) {
      return [
        // getTokenLogoURL({ address: checkSummed, chainId: activeNetwork.chainId }),
        ...uriLocationsHeLa,
      ]
    }
    return []
  }, [
    address,
    activeNetwork.chainId,
    uriLocationsHeLa,
  ])

  return <StyledLogo size={size} srcs={srcs} alt={'token logo'} style={style} {...rest} />
}
