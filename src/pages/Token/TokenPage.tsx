import { ChainId } from '@cytoswap/sdk-core'
import { Trace } from '@uniswap/analytics'
import BarChart from 'components/BarChart/alt'
import { SavedIcon } from 'components/Button'
import CandleChart from 'components/CandleChart'
import { DarkGreyCard, LightGreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import LineChart from 'components/LineChart/alt'
import Loader, { LocalLoader } from 'components/Loader'
import { GenericImageWrapper } from 'components/Logo'
import Percent from 'components/Percent'
import PoolTable from 'components/pools/PoolTable'
import { AutoRow, RowBetween, RowFixed, RowFlat } from 'components/Row'
import { MonoSpace } from 'components/shared'
import { ToggleElementFree, ToggleWrapper } from 'components/Toggle/index'
import TransactionTable from 'components/TransactionsTable'
import { ONE_HOUR_SECONDS, TimeWindow } from 'constants/intervals'
import { HeLaNetworkInfo } from 'constants/networks'
import dayjs from 'dayjs'
import { useCMCLink } from 'hooks/useCMCLink'
import { useColor } from 'hooks/useColor'
import useTheme from 'hooks/useTheme'
import { PageWrapper, ThemedBackground } from 'pages/styled'
import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'react-feather'
import { useParams } from 'react-router-dom'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { usePoolDatas } from 'state/pools/hooks'
import {
  usePoolsForToken,
  useTokenChartData,
  useTokenData,
  useTokenPriceData,
  useTokenTransactions,
} from 'state/tokens/hooks'
import { useSavedTokens } from 'state/user/hooks'
import styled from 'styled-components'
import { StyledInternalLink, TYPE } from 'theme'
import { currentTimestamp, ExplorerDataType, getExplorerLink, shortenAddress } from 'utils'
import { unixToDate } from 'utils/date'
import { networkPrefix } from 'utils/networkPrefix'
import { formatDollarAmount } from 'utils/numbers'
import CMCLogo from '../../assets/images/cmc.png'
import { ExternalLink as StyledExternalLink } from '../../theme/components'

const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 0.8;
`

const ContentLayout = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

const StyledCMCLogo = styled.img`
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

const DEFAULT_TIME_WINDOW = TimeWindow.MONTH

export default function TokenPage() {
  const [activeNetwork] = useActiveNetworkVersion()
  const { address } = useParams<{ address?: string }>()

  const formattedAddress = address?.toLowerCase() ?? ''
  // theming
  const backgroundColor = useColor(formattedAddress)
  const theme = useTheme()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tokenData = useTokenData(formattedAddress)
  const poolsForToken = usePoolsForToken(formattedAddress)
  const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(formattedAddress)
  const chartData = useTokenChartData(formattedAddress)

  // check for link to CMC
  const cmcLink = useCMCLink(formattedAddress)

  // format for chart component
  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  // chart labels
  const [view, setView] = useState(ChartView.PRICE)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()
  const [timeWindow] = useState(DEFAULT_TIME_WINDOW)

  // pricing data
  const priceData = useTokenPriceData(formattedAddress, ONE_HOUR_SECONDS, timeWindow)
  const adjustedToCurrent = useMemo(() => {
    if (priceData && tokenData && priceData.length > 0) {
      const adjusted = Object.assign([], priceData)
      adjusted.push({
        time: currentTimestamp() / 1000,
        open: priceData[priceData.length - 1].close,
        close: tokenData?.priceUSD,
        high: tokenData?.priceUSD,
        low: priceData[priceData.length - 1].close,
      })
      return adjusted
    } else {
      return undefined
    }
  }, [priceData, tokenData])

  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()

  return (
    <Trace page="token-page" shouldLogImpression>
      <PageWrapper>
        <ThemedBackground $backgroundColor={backgroundColor} />
        {tokenData ? (
          !tokenData.exists ? (
            <LightGreyCard style={{ textAlign: 'center' }}>
              No pool has been created with this token yet. Create one
              <StyledExternalLink
                style={{ marginLeft: '4px' }}
                href={`https://cytoswap.com`}
              >
                here.
              </StyledExternalLink>
            </LightGreyCard>
          ) : (
            <AutoColumn $gap="32px">
              <AutoColumn $gap="32px">
                <RowBetween>
                  <AutoRow $gap="4px">
                    <StyledInternalLink to={networkPrefix(activeNetwork)}>
                      <TYPE.main>{`Home > `}</TYPE.main>
                    </StyledInternalLink>
                    <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                      <TYPE.label>{` Tokens `}</TYPE.label>
                    </StyledInternalLink>
                    <TYPE.main>{` > `}</TYPE.main>
                    <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
                    <StyledExternalLink
                      href={getExplorerLink(ChainId.HELA, formattedAddress, ExplorerDataType.ADDRESS)}
                    >
                      <TYPE.main>{` (${shortenAddress(formattedAddress)}) `}</TYPE.main>
                    </StyledExternalLink>
                  </AutoRow>
                  <RowFixed align="center" justify="center">
                    <SavedIcon
                      fill={savedTokens.includes(formattedAddress)}
                      onClick={() => addSavedToken(formattedAddress)}
                    />
                    {cmcLink && (
                      <StyledExternalLink href={cmcLink} style={{ marginLeft: '12px' }}>
                        <StyledCMCLogo src={CMCLogo} />
                      </StyledExternalLink>
                    )}
                    <StyledExternalLink
                      href={getExplorerLink(ChainId.HELA, formattedAddress, ExplorerDataType.ADDRESS)}
                    >
                      <ExternalLink stroke={theme?.text2} size={'17px'} style={{ marginLeft: '12px' }} />
                    </StyledExternalLink>
                  </RowFixed>
                </RowBetween>
                <ResponsiveRow align="flex-end">
                  <AutoColumn $gap="md">
                    <RowFixed gap="lg">
                      <CurrencyLogo address={formattedAddress} />
                      <TYPE.label ml={'10px'} fontSize="20px">
                        {tokenData.name}
                      </TYPE.label>
                      <TYPE.main ml={'6px'} fontSize="20px">
                        ({tokenData.symbol})
                      </TYPE.main>
                      {activeNetwork === HeLaNetworkInfo ? null : (
                        <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size={'26px'} />
                      )}
                    </RowFixed>
                    <RowFlat style={{ marginTop: '8px' }}>
                      <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                      (<Percent value={tokenData.priceUSDChange} />)
                    </RowFlat>
                  </AutoColumn>
                </ResponsiveRow>
              </AutoColumn>
              <ContentLayout>
                <DarkGreyCard>
                  <AutoColumn $gap="lg">
                    <AutoColumn $gap="4px">
                      <TYPE.main fontWeight={400}>TVL</TYPE.main>
                      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.tvlUSD)}</TYPE.label>
                      <Percent value={tokenData.tvlUSDChange} />
                    </AutoColumn>
                    <AutoColumn $gap="4px">
                      <TYPE.main fontWeight={400}>24h Trading Vol</TYPE.main>
                      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                      <Percent value={tokenData.volumeUSDChange} />
                    </AutoColumn>
                    <AutoColumn $gap="4px">
                      <TYPE.main fontWeight={400}>7d Trading Vol</TYPE.main>
                      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSDWeek)}</TYPE.label>
                    </AutoColumn>
                    <AutoColumn $gap="4px">
                      <TYPE.main fontWeight={400}>24h Fees</TYPE.main>
                      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.feesUSD)}</TYPE.label>
                    </AutoColumn>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <RowBetween align="flex-start">
                    <AutoColumn>
                      <RowFixed>
                        <TYPE.label fontSize="24px" height="30px">
                          <MonoSpace>
                            {latestValue
                              ? formatDollarAmount(latestValue, 2)
                              : view === ChartView.VOL
                              ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                              : view === ChartView.TVL
                              ? formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                              : formatDollarAmount(tokenData.priceUSD, 2)}
                          </MonoSpace>
                        </TYPE.label>
                      </RowFixed>
                      <TYPE.main height="20px" fontSize="12px">
                        {valueLabel ? (
                          <MonoSpace>{valueLabel} (UTC)</MonoSpace>
                        ) : (
                          <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                        )}
                      </TYPE.main>
                    </AutoColumn>
                    <ToggleWrapper width="180px">
                      <ToggleElementFree
                        isActive={view === ChartView.VOL}
                        fontSize="12px"
                        onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                      >
                        Volume
                      </ToggleElementFree>
                      <ToggleElementFree
                        isActive={view === ChartView.TVL}
                        fontSize="12px"
                        onClick={() => (view === ChartView.TVL ? setView(ChartView.PRICE) : setView(ChartView.TVL))}
                      >
                        TVL
                      </ToggleElementFree>
                      <ToggleElementFree
                        isActive={view === ChartView.PRICE}
                        fontSize="12px"
                        onClick={() => setView(ChartView.PRICE)}
                      >
                        Price
                      </ToggleElementFree>
                    </ToggleWrapper>
                  </RowBetween>
                  {view === ChartView.TVL ? (
                    <LineChart
                      data={formattedTvlData}
                      color={activeNetwork.primaryColor}
                      minHeight={340}
                      value={latestValue}
                      label={valueLabel}
                      setValue={setLatestValue}
                      setLabel={setValueLabel}
                    />
                  ) : view === ChartView.VOL ? (
                    <BarChart
                      data={formattedVolumeData}
                      color={activeNetwork.primaryColor}
                      minHeight={340}
                      value={latestValue}
                      label={valueLabel}
                      setValue={setLatestValue}
                      setLabel={setValueLabel}
                    />
                  ) : view === ChartView.PRICE ? (
                    adjustedToCurrent ? (
                      <CandleChart
                        data={adjustedToCurrent}
                        setValue={setLatestValue}
                        setLabel={setValueLabel}
                        color={activeNetwork.primaryColor}
                      />
                    ) : (
                      <LocalLoader fill={false} />
                    )
                  ) : null}
                </DarkGreyCard>
              </ContentLayout>
              <TYPE.main>Pools</TYPE.main>
              <DarkGreyCard>
                <PoolTable poolDatas={poolDatas} />
              </DarkGreyCard>
              <TYPE.main>Transactions</TYPE.main>
              <DarkGreyCard>
                {transactions ? (
                  <TransactionTable transactions={transactions} color={activeNetwork.primaryColor} />
                ) : (
                  <LocalLoader fill={false} />
                )}
              </DarkGreyCard>
            </AutoColumn>
          )
        ) : (
          <Loader />
        )}
      </PageWrapper>
    </Trace>
  )
}
