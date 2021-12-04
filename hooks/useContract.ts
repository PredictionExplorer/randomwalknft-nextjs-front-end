import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'

import { useActiveWeb3React } from './web3'

export default function useContract<T extends Contract = Contract>(
  address: string,
  ABI: any,
): T | null {
  const { library, account, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library || !chainId) {
      return null
    }

    try {
      if (account) {
        return new Contract(address, ABI, library.getSigner(account))
      } else {
        return new Contract(address, ABI, library)
      }
    } catch (error) {
      console.error('Failed To Get Contract', error)

      return null
    }
  }, [address, ABI, library, account]) as T
}
