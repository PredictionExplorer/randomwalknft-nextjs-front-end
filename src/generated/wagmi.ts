import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Market
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const marketAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'offerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ItemBought',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
        indexed: true,
      },
      {
        name: 'offerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NewOffer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'offerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'OfferCanceled',
  },
  {
    type: 'function',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptBuyOffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptSellOffer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelBuyOffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelSellOffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getBuyOffers',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'buyer', internalType: 'address', type: 'address' },
    ],
    name: 'getBuyOffersBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'buyer', internalType: 'address', type: 'address' },
    ],
    name: 'getBuyTokensBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getSellOffers',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'seller', internalType: 'address', type: 'address' },
    ],
    name: 'getSellOffersBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'seller', internalType: 'address', type: 'address' },
    ],
    name: 'getSellTokenBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'makeBuyOffer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_nftAddress',
        internalType: 'contract IERC721',
        type: 'address',
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'price', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'makeSellOffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numOffers',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'offers',
    outputs: [
      { name: 'nftAddress', internalType: 'contract IERC721', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'price', internalType: 'uint256', type: 'uint256' },
      { name: 'seller', internalType: 'address', type: 'address' },
      { name: 'buyer', internalType: 'address', type: 'address' },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
] as const

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const marketAddress = {
  42161: '0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08',
} as const

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const marketConfig = { address: marketAddress, abi: marketAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Nft
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const nftAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'seed',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MintEvent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newName',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'TokenNameEvent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'destination',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WithdrawalEvent',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entropy',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMintPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastMintTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastMinter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numWithdrawals',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'price',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'saleTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'seeds',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_owner', internalType: 'address', type: 'address' }],
    name: 'seedsOfOwner',
    outputs: [{ name: '', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'baseURI', internalType: 'string', type: 'string' }],
    name: 'setBaseURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
    ],
    name: 'setTokenName',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timeUntilSale',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timeUntilWithdrawal',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenGenerationScript',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenNames',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_owner', internalType: 'address', type: 'address' }],
    name: 'walletOfOwner',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawalAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawalAmounts',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawalNums',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawalWaitSeconds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const nftAddress = {
  42161: '0x895a6F444BE4ba9d124F61DF736605792B35D66b',
} as const

/**
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const nftConfig = { address: nftAddress, abi: nftAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarket = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getBuyOffers"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketGetBuyOffers = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'getBuyOffers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getBuyOffersBy"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketGetBuyOffersBy = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'getBuyOffersBy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getBuyTokensBy"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketGetBuyTokensBy = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'getBuyTokensBy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getSellOffers"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketGetSellOffers = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'getSellOffers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getSellOffersBy"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketGetSellOffersBy = /*#__PURE__*/ createUseReadContract(
  { abi: marketAbi, address: marketAddress, functionName: 'getSellOffersBy' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getSellTokenBy"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketGetSellTokenBy = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'getSellTokenBy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"numOffers"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketNumOffers = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'numOffers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"offers"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketOffers = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'offers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"onERC721Received"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useReadMarketOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarket = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  address: marketAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"acceptBuyOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarketAcceptBuyOffer =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'acceptBuyOffer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"acceptSellOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarketAcceptSellOffer =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'acceptSellOffer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"cancelBuyOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarketCancelBuyOffer =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'cancelBuyOffer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"cancelSellOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarketCancelSellOffer =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'cancelSellOffer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"makeBuyOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarketMakeBuyOffer = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  address: marketAddress,
  functionName: 'makeBuyOffer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"makeSellOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWriteMarketMakeSellOffer = /*#__PURE__*/ createUseWriteContract(
  { abi: marketAbi, address: marketAddress, functionName: 'makeSellOffer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarket = /*#__PURE__*/ createUseSimulateContract({
  abi: marketAbi,
  address: marketAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"acceptBuyOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarketAcceptBuyOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'acceptBuyOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"acceptSellOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarketAcceptSellOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'acceptSellOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"cancelBuyOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarketCancelBuyOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'cancelBuyOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"cancelSellOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarketCancelSellOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'cancelSellOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"makeBuyOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarketMakeBuyOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'makeBuyOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"makeSellOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useSimulateMarketMakeSellOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    address: marketAddress,
    functionName: 'makeSellOffer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWatchMarketEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: marketAbi,
  address: marketAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"ItemBought"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWatchMarketItemBoughtEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    address: marketAddress,
    eventName: 'ItemBought',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"NewOffer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWatchMarketNewOfferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    address: marketAddress,
    eventName: 'NewOffer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"OfferCanceled"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08)
 */
export const useWatchMarketOfferCanceledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    address: marketAddress,
    eventName: 'OfferCanceled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNft = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"entropy"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftEntropy = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'entropy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"getApproved"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"getMintPrice"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftGetMintPrice = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'getMintPrice',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'isApprovedForAll',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"lastMintTime"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftLastMintTime = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'lastMintTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"lastMinter"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftLastMinter = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'lastMinter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftName = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"nextTokenId"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftNextTokenId = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'nextTokenId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"numWithdrawals"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftNumWithdrawals = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'numWithdrawals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftOwner = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"price"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftPrice = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'price',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"saleTime"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftSaleTime = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'saleTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"seeds"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftSeeds = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'seeds',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"seedsOfOwner"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftSeedsOfOwner = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'seedsOfOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftSupportsInterface = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftSymbol = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"timeUntilSale"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTimeUntilSale = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'timeUntilSale',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"timeUntilWithdrawal"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTimeUntilWithdrawal =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'timeUntilWithdrawal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTokenByIndex = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'tokenByIndex',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"tokenGenerationScript"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTokenGenerationScript =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'tokenGenerationScript',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"tokenNames"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTokenNames = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'tokenNames',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"tokenURI"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"walletOfOwner"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftWalletOfOwner = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'walletOfOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"withdrawalAmount"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftWithdrawalAmount = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'withdrawalAmount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"withdrawalAmounts"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftWithdrawalAmounts = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'withdrawalAmounts',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"withdrawalNums"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftWithdrawalNums = /*#__PURE__*/ createUseReadContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'withdrawalNums',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"withdrawalWaitSeconds"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useReadNftWithdrawalWaitSeconds =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'withdrawalWaitSeconds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNft = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftApprove = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftMint = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftSafeTransferFrom = /*#__PURE__*/ createUseWriteContract(
  { abi: nftAbi, address: nftAddress, functionName: 'safeTransferFrom' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftSetBaseUri = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'setBaseURI',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"setTokenName"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftSetTokenName = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'setTokenName',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWriteNftWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNft = /*#__PURE__*/ createUseSimulateContract({
  abi: nftAbi,
  address: nftAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"mint"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftMint = /*#__PURE__*/ createUseSimulateContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftSetBaseUri = /*#__PURE__*/ createUseSimulateContract(
  { abi: nftAbi, address: nftAddress, functionName: 'setBaseURI' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"setTokenName"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftSetTokenName =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'setTokenName',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAbi,
    address: nftAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAbi}__ and `functionName` set to `"withdraw"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useSimulateNftWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: nftAbi,
  address: nftAddress,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nftAbi,
  address: nftAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"Approval"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"MintEvent"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftMintEventEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'MintEvent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"TokenNameEvent"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftTokenNameEventEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'TokenNameEvent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"Transfer"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAbi}__ and `eventName` set to `"WithdrawalEvent"`
 *
 * [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b)
 */
export const useWatchNftWithdrawalEventEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAbi,
    address: nftAddress,
    eventName: 'WithdrawalEvent',
  })
