import { MARKET_ADDRESS } from '../config/app'
import MARKET_ABI from '../contracts/Market.json'
import type { Market } from '../contracts/types'

import useContract from './useContract'

export default function useMarketContract() {
  return useContract<Market>(MARKET_ADDRESS, MARKET_ABI)
}
