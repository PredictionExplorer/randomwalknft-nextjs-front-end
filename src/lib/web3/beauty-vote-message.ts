/** Must match `beautyVoteSignMessage` in rwcg/websrv/api/randomwalk/handlers_ranking.go (EIP-191 personal_sign payload). */
export function buildBeautyVoteMessage(opts: {
  chainId: number;
  signNonce: string;
  nft1: number;
  nft2: number;
  winner: number;
}): string {
  const { chainId, signNonce, nft1, nft2, winner } = opts;
  return `RandomWalk beauty vote\nVersion: 1\nchainId: ${chainId}\nnonce: ${signNonce}\nnft1: ${nft1}\nnft2: ${nft2}\nwinner: ${winner}`;
}
