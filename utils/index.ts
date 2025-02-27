import type { BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'

export function shortenHex(hex: string, length = 4) {
  return `${hex.substring(0, length + 2)}....${hex.substring(
    hex.length - length,
  )}`
}

const ETHERSCAN_PREFIXES = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
}

export function formatEtherscanLink(
  type: 'Account' | 'Transaction',
  data: [number, string],
) {
  switch (type) {
    case 'Account': {
      const [chainId, address] = data
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/address/${address}`
    }
    case 'Transaction': {
      const [chainId, hash] = data
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`
    }
  }
}

export const parseBalance = (
  value: BigNumberish,
  decimals = 18,
  decimalsToDisplay = 4,
) => parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay)

export const formatId = (id: number | string) => {
  return `#${id.toString().padStart(6, '0')}`
}

export const getAssetsUrl = (url: string) => {
  const proxyUrl = "/api/proxy?url=";
  const imageServerUrl = "http://161.129.67.58/images/randomwalk/";
  return `${proxyUrl}${encodeURIComponent(imageServerUrl + url)}`;
};

export const getOriginUrl = (url: string) => {
  const decodedUrl = decodeURIComponent(url);
  const originUrl = decodedUrl.replace(/\/api\/proxy\?url=/, '');
  return originUrl;
};