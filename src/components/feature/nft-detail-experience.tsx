"use client";

import Image from "next/image";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";

import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  marketAbi,
  useReadNftIsApprovedForAll,
  useReadNftOwnerOf,
  useReadNftTotalSupply,
  useReadNftWalletOfOwner,
  useWriteMarketAcceptSellOffer,
  useWriteMarketCancelSellOffer,
  useWriteMarketMakeBuyOffer,
  useWriteMarketMakeSellOffer,
  useWriteNftSetApprovalForAll,
  useWriteNftSetTokenName,
  useWriteNftTransferFrom
} from "@/generated/wagmi";
import { MARKET_ADDRESS, NFT_ADDRESS } from "@/lib/config";
import type { AssetTheme, Nft, Offer } from "@/lib/types";
import { formatDateTimeFromUnix, formatEth, formatId, getAssetBySelection, getAssetImage, getAssetPreview, shortenAddress } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";

type NftDetailExperienceProps = {
  nft: Nft;
  buyOffers: Offer[];
  sellOffers: Offer[];
  message?: string | undefined;
};

export function NftDetailExperience({
  nft,
  buyOffers,
  sellOffers,
  message
}: NftDetailExperienceProps) {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [theme, setTheme] = useState<AssetTheme>("black");
  const [modal, setModal] = useState<null | "image" | "singleVideo" | "tripleVideo">(null);
  const [price, setPrice] = useState("");
  const [tokenName, setTokenName] = useState(nft.name);
  const [transferAddress, setTransferAddress] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  const { data: ownerOf } = useReadNftOwnerOf({
    args: [BigInt(nft.id)]
  });
  const { data: totalSupply } = useReadNftTotalSupply();
  const { data: accountTokenIds } = useReadNftWalletOfOwner({
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) }
  });
  const { data: approvedForAll } = useReadNftIsApprovedForAll({
    args: address ? [address, MARKET_ADDRESS] : undefined,
    query: { enabled: Boolean(address) }
  });
  const approveAll = useWriteNftSetApprovalForAll();
  const makeSellOffer = useWriteMarketMakeSellOffer();
  const makeBuyOffer = useWriteMarketMakeBuyOffer();
  const cancelSellOffer = useWriteMarketCancelSellOffer();
  const acceptSellOffer = useWriteMarketAcceptSellOffer();
  const transferFrom = useWriteNftTransferFrom();
  const setTokenNameMutation = useWriteNftSetTokenName();

  const owner = ownerOf ?? nft.owner;
  const isOwner = address?.toLowerCase() === owner.toLowerCase();
  const activeSellOffer = sellOffers[0];
  const highestOffer = buyOffers.reduce((max, offer) => Math.max(max, offer.price), 0);
  const walletTokenIds = (accountTokenIds ?? []).map((id) => Number(id));
  const currentWalletIndex = walletTokenIds.indexOf(nft.id);
  const userSellOffer = sellOffers.find((offer) => offer.seller.toLowerCase() === address?.toLowerCase());
  const currentAssetThumb = getAssetPreview(nft.assets, theme);

  useEffect(() => {
    if (!totalSupply) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        router.push(`/detail/${Math.max(nft.id - 1, 0)}`);
      }
      if (event.key === "ArrowRight") {
        router.push(`/detail/${Math.min(nft.id + 1, Number(totalSupply) - 1)}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nft.id, router, totalSupply]);

  useEffect(() => {
    if (message === "success") {
      toast.success("Media files are being generated. Refresh in a few minutes if assets are still processing.");
    }
  }, [message]);

  const mediaSrc = modal
    ? modal === "image"
      ? getAssetImage(nft.assets, theme)
      : getAssetBySelection(nft.assets, theme, modal)
    : null;

  async function runMutation(action: () => Promise<void>) {
    try {
      setIsMutating(true);
      await action();
      toast.success("Transaction confirmed.");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <PageShell className="space-y-8 py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardContent className="relative p-0">
              <button type="button" className="relative block aspect-[1.6/1] w-full cursor-zoom-in overflow-hidden" onClick={() => setModal("image")}>
                <Image
                  src={currentAssetThumb}
                  alt={`Preview image for NFT ${formatId(nft.id)}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 flex items-center gap-3">
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm tracking-[0.18em] text-secondary backdrop-blur">
                    {formatId(nft.id)}
                  </span>
                  {activeSellOffer ? (
                    <span className="rounded-full border border-primary/30 bg-primary/15 px-4 py-2 text-sm text-primary">
                      {formatEth(activeSellOffer.price)}
                    </span>
                  ) : null}
                </div>
              </button>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-4">
            <Button variant={theme === "black" ? "default" : "outline"} onClick={() => setTheme("black")}>
              Dark
            </Button>
            <Button variant={theme === "white" ? "default" : "outline"} onClick={() => setTheme("white")}>
              Light
            </Button>
            <Button variant="outline" onClick={() => setModal("singleVideo")}>
              Single video
            </Button>
            <Button variant="outline" onClick={() => setModal("tripleVideo")}>
              Triple video
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => router.push(`/detail/${Math.max(nft.id - 1, 0)}` as Route)}>
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/detail/${Math.min(nft.id + 1, Number(totalSupply ?? BigInt(nft.id + 1)) - 1)}` as Route)}
            >
              Next
            </Button>
          </div>

          {isOwner && walletTokenIds.length > 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/detail/${walletTokenIds[Math.max(currentWalletIndex - 1, 0)]}` as Route)}
              >
                Prev in wallet
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/detail/${walletTokenIds[Math.min(currentWalletIndex + 1, walletTokenIds.length - 1)]}` as Route)
                }
              >
                Next in wallet
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{nft.name || formatId(nft.id)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Owner</span>
                <a href={`/gallery?address=${owner}`} className="text-secondary">
                  {owner}
                </a>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Seed</span>
                <span>{nft.seed}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Beauty score</span>
                <span>{nft.rating.toFixed(2)}</span>
              </div>
              {nft.tokenHistory[0] ? (
                <div>
                  <span className="block text-xs uppercase tracking-[0.24em]">Minted</span>
                  <span>{formatDateTimeFromUnix(nft.tokenHistory[0].timestamp)}</span>
                </div>
              ) : null}
              {highestOffer > 0 ? (
                <div>
                  <span className="block text-xs uppercase tracking-[0.24em]">Highest offer</span>
                  <span>{formatEth(highestOffer)}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isOwner ? "Owner actions" : "Market actions"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Transfer</label>
                    <div className="flex gap-3">
                      <Input placeholder="Enter recipient address" value={transferAddress} onChange={(event) => setTransferAddress(event.target.value)} />
                      <Button
                        onClick={() =>
                          void runMutation(async () => {
                            const hash = await transferFrom.writeContractAsync({
                              args: [address!, transferAddress as `0x${string}`, BigInt(nft.id)]
                            });
                            await publicClient?.waitForTransactionReceipt({ hash });
                          })
                        }
                      >
                        Send
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Put on sale</label>
                    <div className="flex gap-3">
                      <Input placeholder="Enter ETH price" value={price} onChange={(event) => setPrice(event.target.value)} />
                      <Button
                        onClick={() =>
                          void runMutation(async () => {
                            if (!approvedForAll) {
                              const approvalHash = await approveAll.writeContractAsync({
                                args: [MARKET_ADDRESS, true]
                              });
                              await publicClient?.waitForTransactionReceipt({ hash: approvalHash });
                            }

                            const hash = await makeSellOffer.writeContractAsync({
                              args: [NFT_ADDRESS, BigInt(nft.id), parseEther(price)]
                            });
                            await publicClient?.waitForTransactionReceipt({ hash });
                          })
                        }
                      >
                        Sell
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Rename</label>
                    <div className="flex gap-3">
                      <Input placeholder="Enter token name" value={tokenName} onChange={(event) => setTokenName(event.target.value)} />
                      <Button
                        onClick={() =>
                          void runMutation(async () => {
                            const hash = await setTokenNameMutation.writeContractAsync({
                              args: [BigInt(nft.id), tokenName]
                            });
                            await publicClient?.waitForTransactionReceipt({ hash });
                          })
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!userSellOffer ? (
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Bid</label>
                      <div className="flex gap-3">
                        <Input placeholder="Enter ETH price" value={price} onChange={(event) => setPrice(event.target.value)} />
                        <Button
                          onClick={() =>
                            void runMutation(async () => {
                              const hash = await makeBuyOffer.writeContractAsync({
                                args: [NFT_ADDRESS, BigInt(nft.id)],
                                value: parseEther(price)
                              });
                              await publicClient?.waitForTransactionReceipt({ hash });
                            })
                          }
                        >
                          Make offer
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {userSellOffer ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        void runMutation(async () => {
                          const hash = await cancelSellOffer.writeContractAsync({
                            args: [BigInt(userSellOffer.offerId)]
                          });
                          await publicClient?.waitForTransactionReceipt({ hash });
                        })
                      }
                    >
                      Cancel sell offer
                    </Button>
                  ) : activeSellOffer && owner.toLowerCase() === MARKET_ADDRESS.toLowerCase() ? (
                    <Button
                      onClick={() =>
                        void runMutation(async () => {
                          const offer = await publicClient?.readContract({
                            abi: marketAbi,
                            address: MARKET_ADDRESS,
                            functionName: "offers",
                            args: [BigInt(activeSellOffer.offerId)]
                          });
                          const priceValue = Array.isArray(offer) ? offer[2] : BigInt(0);
                          const hash = await acceptSellOffer.writeContractAsync({
                            args: [BigInt(activeSellOffer.offerId)],
                            value: priceValue as bigint
                          });
                          await publicClient?.waitForTransactionReceipt({ hash });
                        })
                      }
                    >
                      Buy now for {formatEth(activeSellOffer.price)}
                    </Button>
                  ) : null}
                </>
              )}
              {isMutating ? <p className="text-sm text-muted-foreground">Waiting for confirmation...</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success("Detail page copied."))}>
                Copy detail link
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigator.clipboard
                    .writeText(getAssetImage(nft.assets, theme))
                    .then(() => toast.success("Image link copied."))
                }
              >
                Copy image link
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigator.clipboard
                    .writeText(getAssetBySelection(nft.assets, theme, "singleVideo"))
                    .then(() => toast.success("Video link copied."))
                }
              >
                Copy single video
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {buyOffers.length ? (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Buy offers</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyOffers.map((offer) => (
                    <TableRow key={offer.offerId}>
                      <TableCell>{shortenAddress(offer.buyer)}</TableCell>
                      <TableCell>{formatEth(offer.price)}</TableCell>
                      <TableCell>{formatDateTimeFromUnix(offer.createdAtTimestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}

      {nft.tokenHistory.length ? (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Token history</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead>Owner / Buyer</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nft.tokenHistory.map((record, index) => (
                    <TableRow key={`${record.recordType}-${record.timestamp}-${index}`}>
                      <TableCell>{record.recordType === 1 ? "Mint" : "Transfer / Market"}</TableCell>
                      <TableCell>{shortenAddress(record.owner ?? record.buyer ?? record.seller ?? owner)}</TableCell>
                      <TableCell>{record.price ? formatEth(record.price) : "N/A"}</TableCell>
                      <TableCell>{formatDateTimeFromUnix(record.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Dialog open={Boolean(modal)} onOpenChange={(open) => setModal(open ? modal : null)}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {modal === "image"
              ? `Image preview for ${formatId(nft.id)}`
              : modal === "singleVideo"
                ? `Single video preview for ${formatId(nft.id)}`
                : `Triple video preview for ${formatId(nft.id)}`}
          </DialogTitle>
          {modal === "image" && mediaSrc ? (
            <Image
              src={mediaSrc}
              alt={`Full-size artwork for NFT ${formatId(nft.id)}`}
              width={1600}
              height={1000}
              className="h-auto w-full"
            />
          ) : mediaSrc ? (
            <video autoPlay controls className="max-h-[80vh] w-full" src={mediaSrc} />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
