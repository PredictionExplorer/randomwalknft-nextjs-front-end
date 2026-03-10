"use client";

import Image from "next/image";
import type { Route } from "next";
import { Film, Image as ImageIcon, Play } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAddress, parseEther } from "viem";
import { usePublicClient } from "wagmi";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { MARKET_ADDRESS, NFT_ADDRESS } from "@/lib/config";
import type { AssetTheme, AssetVariant, Nft, Offer } from "@/lib/types";
import {
  formatDateTimeFromUnix,
  formatEth,
  formatId,
  getAssetBySelection,
  getAssetImage,
  getAssetPreview,
  shortenAddress
} from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { showWalletError } from "@/lib/web3/wallet-toast";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import {
  marketAbi,
  nftAbi,
  useReadNftIsApprovedForAll,
  useReadNftOwnerOf,
  useReadNftTotalSupply,
  useReadNftWalletOfOwner,
  useWriteMarketAcceptSellOffer,
  useWriteMarketCancelBuyOffer,
  useWriteMarketCancelSellOffer,
  useWriteMarketMakeBuyOffer,
  useWriteMarketMakeSellOffer,
  useWriteNftSetApprovalForAll,
  useWriteNftSetTokenName,
  useWriteNftTransferFrom
} from "@/generated/wagmi";
import { prepareContractWrite } from "@/lib/web3/transaction-preflight";

type NftDetailExperienceProps = {
  nft: Nft;
  buyOffers: Offer[];
  sellOffers: Offer[];
  message?: string | undefined;
  initialTheme: AssetTheme;
  initialMedia: AssetVariant;
};

const mediaLabels: Record<AssetVariant, string> = {
  image: "Image",
  singleVideo: "Single video",
  tripleVideo: "Triple video"
};

const allMediaReady: Record<AssetVariant, boolean> = {
  image: true,
  singleVideo: true,
  tripleVideo: true
};

const noMediaReady: Record<AssetVariant, boolean> = {
  image: false,
  singleVideo: false,
  tripleVideo: false
};

async function probeAssetReady(url: string) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store"
    });
    return response.ok && response.headers.get("x-asset-status") === "ready";
  } catch {
    return false;
  }
}

export function NftDetailExperience({
  nft,
  buyOffers,
  sellOffers,
  message,
  initialTheme,
  initialMedia
}: NftDetailExperienceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { address, isConnected, isWrongNetwork } = useWalletStatus();
  const [theme, setTheme] = useState<AssetTheme>(initialTheme);
  const [activeMedia, setActiveMedia] = useState<AssetVariant>(initialMedia);
  const [modal, setModal] = useState<AssetVariant | null>(initialMedia);
  const [price, setPrice] = useState("");
  const [tokenName, setTokenName] = useState(nft.name);
  const [transferAddress, setTransferAddress] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [flashMessage, setFlashMessage] = useState(message);

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
  const cancelBuyOffer = useWriteMarketCancelBuyOffer();
  const acceptSellOffer = useWriteMarketAcceptSellOffer();
  const transferFrom = useWriteNftTransferFrom();
  const setTokenNameMutation = useWriteNftSetTokenName();

  const owner = ownerOf ?? nft.owner;
  const isPendingMetadata = Boolean(nft.isPendingMetadata);
  const shouldProbeMedia = isPendingMetadata || message === "success";
  const isOwner = address?.toLowerCase() === owner.toLowerCase();
  const wrongNetwork = isWrongNetwork;
  const activeSellOffer = sellOffers[0];
  const highestOffer = buyOffers.reduce((max, offer) => Math.max(max, offer.price), 0);
  const walletTokenIds = (accountTokenIds ?? []).map((id) => Number(id));
  const currentWalletIndex = walletTokenIds.indexOf(nft.id);
  const userSellOffer = sellOffers.find((offer) => offer.seller.toLowerCase() === address?.toLowerCase());
  const userBuyOffer = buyOffers.find((offer) => offer.buyer.toLowerCase() === address?.toLowerCase());
  const [mediaAvailability, setMediaAvailability] = useState<Record<AssetVariant, boolean>>(
    shouldProbeMedia ? noMediaReady : allMediaReady
  );
  const currentAssetThumb = getAssetPreview(nft.assets, theme);
  const modalSource =
    modal === null
      ? null
      : modal === "image"
        ? getAssetImage(nft.assets, theme)
        : getAssetBySelection(nft.assets, theme, modal);
  const activeMediaReady = mediaAvailability[activeMedia];
  const imageZoomReady = mediaAvailability.image;
  const singleVideoReady = mediaAvailability.singleVideo;
  const tripleVideoReady = mediaAvailability.tripleVideo;
  const hasPendingMedia = !imageZoomReady || !singleVideoReady || !tripleVideoReady;

  useEffect(() => {
    setFlashMessage(message);
  }, [message]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (flashMessage) {
      params.set("message", flashMessage);
    }
    if (theme !== "black") {
      params.set("theme", theme);
    }
    if (activeMedia !== "image") {
      params.set("media", activeMedia);
    }

    const href = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(href as Route, { scroll: false });
  }, [activeMedia, flashMessage, pathname, router, theme]);

  useEffect(() => {
    if (!totalSupply) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        router.push(`/detail/${Math.max(nft.id - 1, 0)}` as Route);
      }
      if (event.key === "ArrowRight") {
        router.push(`/detail/${Math.min(nft.id + 1, Number(totalSupply) - 1)}` as Route);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nft.id, router, totalSupply]);

  useEffect(() => {
    if (flashMessage === "success") {
      toast.success("Media files are being generated. Refresh in a few minutes if assets are still processing.");
      setFlashMessage(undefined);
    }
  }, [flashMessage]);

  useEffect(() => {
    if (!isPendingMetadata) {
      return;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [isPendingMetadata, router]);

  useEffect(() => {
    let cancelled = false;

    if (!shouldProbeMedia) {
      setMediaAvailability(allMediaReady);
      return;
    }

    void Promise.all([
      probeAssetReady(getAssetImage(nft.assets, theme)),
      probeAssetReady(getAssetBySelection(nft.assets, theme, "singleVideo")),
      probeAssetReady(getAssetBySelection(nft.assets, theme, "tripleVideo"))
    ]).then(([image, singleVideo, tripleVideo]) => {
      if (cancelled) {
        return;
      }

      setMediaAvailability({
        image,
        singleVideo,
        tripleVideo
      });
    });

    return () => {
      cancelled = true;
    };
  }, [nft.assets, shouldProbeMedia, theme]);

  useEffect(() => {
    if (activeMedia === "singleVideo" && !singleVideoReady) {
      setActiveMedia("image");
    }

    if (activeMedia === "tripleVideo" && !tripleVideoReady) {
      setActiveMedia("image");
    }
  }, [activeMedia, singleVideoReady, tripleVideoReady]);

  useEffect(() => {
    if (modal === "image" && !imageZoomReady) {
      setModal(null);
    }

    if (modal === "singleVideo" && !singleVideoReady) {
      setModal(null);
    }

    if (modal === "tripleVideo" && !tripleVideoReady) {
      setModal(null);
    }
  }, [imageZoomReady, modal, singleVideoReady, tripleVideoReady]);

  async function runMutation(action: () => Promise<void>) {
    try {
      setIsMutating(true);
      trackEvent("transaction_submitted", { tokenId: nft.id });
      await action();
      trackEvent("transaction_confirmed", { tokenId: nft.id });
      toast.success("Transaction confirmed.");
      router.refresh();
    } catch (error) {
      trackEvent("transaction_failed", {
        tokenId: nft.id,
        message: getErrorMessage(error)
      });
      showWalletError(error);
    } finally {
      setIsMutating(false);
    }
  }

  async function createSellOffer() {
    if (!price || Number(price) <= 0) {
      throw new Error("Enter a valid ETH price.");
    }

    if (!publicClient || !address) {
      throw new Error("Connect your wallet to continue.");
    }

    const priceValue = parseEther(price);

    if (!approvedForAll) {
      const { gas: approvalGas } = await prepareContractWrite({
        publicClient,
        account: address,
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "setApprovalForAll",
        args: [MARKET_ADDRESS, true]
      });
      const approvalHash = await approveAll.writeContractAsync({
        args: [MARKET_ADDRESS, true],
        gas: approvalGas
      });
      await publicClient.waitForTransactionReceipt({ hash: approvalHash });
    }

    const { gas } = await prepareContractWrite({
      publicClient,
      account: address,
      address: MARKET_ADDRESS,
      abi: marketAbi,
      functionName: "makeSellOffer",
      args: [NFT_ADDRESS, BigInt(nft.id), priceValue]
    });
    const hash = await makeSellOffer.writeContractAsync({
      args: [NFT_ADDRESS, BigInt(nft.id), priceValue],
      gas
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function createBuyOffer() {
    if (!price || Number(price) <= 0) {
      throw new Error("Enter a valid ETH price.");
    }

    if (!publicClient || !address) {
      throw new Error("Connect your wallet to continue.");
    }

    const bidValue = parseEther(price);
    const { gas } = await prepareContractWrite({
      publicClient,
      account: address,
      address: MARKET_ADDRESS,
      abi: marketAbi,
      functionName: "makeBuyOffer",
      args: [NFT_ADDRESS, BigInt(nft.id)],
      value: bidValue
    });
    const hash = await makeBuyOffer.writeContractAsync({
      args: [NFT_ADDRESS, BigInt(nft.id)],
      value: bidValue,
      gas
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function renameToken() {
    if (!tokenName.trim()) {
      throw new Error("Name cannot be empty.");
    }

    if (!publicClient || !address) {
      throw new Error("Connect your wallet to continue.");
    }

    const { gas } = await prepareContractWrite({
      publicClient,
      account: address,
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "setTokenName",
      args: [BigInt(nft.id), tokenName.trim()]
    });
    const hash = await setTokenNameMutation.writeContractAsync({
      args: [BigInt(nft.id), tokenName.trim()],
      gas
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function transferToken() {
    if (!isAddress(transferAddress)) {
      throw new Error("Enter a valid wallet address.");
    }

    if (!publicClient || !address) {
      throw new Error("Connect your wallet to continue.");
    }

    const { gas } = await prepareContractWrite({
      publicClient,
      account: address,
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "transferFrom",
      args: [address, transferAddress as `0x${string}`, BigInt(nft.id)]
    });
    const hash = await transferFrom.writeContractAsync({
      args: [address, transferAddress as `0x${string}`, BigInt(nft.id)],
      gas
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function acceptCurrentSellOffer() {
    if (!activeSellOffer) {
      throw new Error("There is no active sell offer to accept.");
    }

    if (!publicClient || !address) {
      throw new Error("Connect your wallet to continue.");
    }

    const offer = await publicClient.readContract({
      abi: marketAbi,
      address: MARKET_ADDRESS,
      functionName: "offers",
      args: [BigInt(activeSellOffer.offerId)]
    });
    const priceValue = Array.isArray(offer) ? offer[2] : BigInt(0);
    const { gas } = await prepareContractWrite({
      publicClient,
      account: address,
      address: MARKET_ADDRESS,
      abi: marketAbi,
      functionName: "acceptSellOffer",
      args: [BigInt(activeSellOffer.offerId)],
      value: priceValue as bigint
    });
    const hash = await acceptSellOffer.writeContractAsync({
      args: [BigInt(activeSellOffer.offerId)],
      value: priceValue as bigint,
      gas
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  return (
    <PageShell className="space-y-8 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/gallery", label: "Collection" },
          { label: formatId(nft.id) }
        ]}
      />

      <PageHeading
        eyebrow="NFT detail"
        title={[{ text: nft.name || formatId(nft.id), tone: "secondary" }]}
        description="View artwork, check the order book, and buy, bid, list, or transfer this token."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden bg-background/55">
            <CardContent className="relative p-0">
              <button
                type="button"
                disabled={!activeMediaReady}
                className={`relative block aspect-[1.6/1] w-full overflow-hidden ${activeMediaReady ? "cursor-zoom-in" : "cursor-default"}`}
                onClick={() => {
                  if (activeMediaReady) {
                    setModal(activeMedia);
                  }
                }}
              >
                <Image
                  src={currentAssetThumb}
                  alt={`Preview image for NFT ${formatId(nft.id)}`}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 1200px) 100vw, 60vw"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
                    {mediaLabels[activeMedia]}
                  </span>
                  <span className="rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
                    {theme === "black" ? "Dark edition" : "Light edition"}
                  </span>
                  {!imageZoomReady ? (
                    <span className="rounded-full border border-amber-300/50 bg-background/85 px-3 py-1 text-xs uppercase tracking-[0.22em] text-amber-200 backdrop-blur">
                      Image processing
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-5 left-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm tracking-[0.18em] text-secondary backdrop-blur">
                    {formatId(nft.id)}
                  </span>
                  {activeSellOffer ? (
                    <span className="rounded-full border border-primary/30 bg-primary px-4 py-2 text-sm font-medium text-[#140a1f]">
                      {formatEth(activeSellOffer.price)}
                    </span>
                  ) : null}
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card/65">
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-2">
                <Button className="flex-1" variant={theme === "black" ? "default" : "outline"} onClick={() => setTheme("black")}>
                  Dark
                </Button>
                <Button className="flex-1" variant={theme === "white" ? "default" : "outline"} onClick={() => setTheme("white")}>
                  Light
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  variant={activeMedia === "image" ? "default" : "outline"}
                  className="gap-2.5"
                  onClick={() => { setActiveMedia("image"); }}
                >
                  <ImageIcon className="h-4 w-4" />
                  Image
                </Button>
                <Button
                  variant={activeMedia === "singleVideo" ? "secondary" : "outline"}
                  className="gap-2.5 border-primary/40"
                  disabled={!singleVideoReady}
                  onClick={() => { setActiveMedia("singleVideo"); }}
                >
                  <Play className="h-4 w-4" />
                  Single video
                </Button>
                <Button
                  variant={activeMedia === "tripleVideo" ? "secondary" : "outline"}
                  className="gap-2.5 border-primary/40"
                  disabled={!tripleVideoReady}
                  onClick={() => { setActiveMedia("tripleVideo"); }}
                >
                  <Film className="h-4 w-4" />
                  Triple video
                </Button>
              </div>
              {hasPendingMedia ? (
                <p className="text-xs text-muted-foreground">
                  {!imageZoomReady ? "Full-size image is still processing." : null}
                  {!imageZoomReady && (!singleVideoReady || !tripleVideoReady) ? " " : null}
                  {!singleVideoReady || !tripleVideoReady ? "Video variants will unlock when processing completes." : null}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => router.push(`/detail/${Math.max(nft.id - 1, 0)}` as Route)}>
              Prev token
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/detail/${Math.min(nft.id + 1, Number(totalSupply ?? BigInt(nft.id + 1)) - 1)}` as Route)}
            >
              Next token
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
          {isPendingMetadata ? (
            <Card className="border-primary/30 bg-card/75">
              <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">This token is minted on-chain and still processing.</p>
                <p>The detail page will refresh automatically while metadata and media files are generated.</p>
              </CardContent>
            </Card>
          ) : null}

          {!isConnected || wrongNetwork ? (
            <WalletStatusCard
              disconnectedTitle="Wallet required"
              disconnectedBody="Connect your wallet to buy, bid, list, rename, or transfer this NFT."
              wrongNetworkBody="Switch to Arbitrum to interact with this token."
            />
          ) : null}

          <Card className="bg-card/65">
            <CardHeader>
              <CardTitle>Collector snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.24em]">Owner</span>
                <a href={`/gallery?address=${owner}`} className="text-secondary transition hover:text-primary" title={owner}>
                  {shortenAddress(owner, 6)}
                </a>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Beauty score</span>
                <span>{isPendingMetadata ? "Processing" : nft.rating.toFixed(2)}</span>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <span className="block text-xs uppercase tracking-[0.24em]">Seed</span>
                <button
                  type="button"
                  className="max-w-full cursor-copy truncate text-left font-mono text-xs text-muted-foreground transition hover:text-secondary"
                  title="Click to copy full seed"
                  onClick={() => navigator.clipboard.writeText(nft.seed).then(() => toast.success("Seed copied."))}
                >
                  {nft.seed}
                </button>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Minted</span>
                <span>{nft.tokenHistory[0] ? formatDateTimeFromUnix(nft.tokenHistory[0].timestamp) : isPendingMetadata ? "Just minted" : "Pending"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Highest bid</span>
                <span>{highestOffer > 0 ? formatEth(highestOffer) : "No bids yet"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em]">Current listing</span>
                <span>{activeSellOffer ? formatEth(activeSellOffer.price) : "Unlisted"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/65">
            <CardHeader>
              <CardTitle>{isOwner ? "Owner actions" : "Market actions"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="transfer-address" className="text-sm text-muted-foreground">
                      Transfer
                    </label>
                    <div className="flex gap-3">
                      <Input
                        id="transfer-address"
                        placeholder="Enter recipient address"
                        value={transferAddress}
                        onChange={(event) => setTransferAddress(event.target.value)}
                      />
                      <Button onClick={() => void runMutation(transferToken)}>Send</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sell-price" className="text-sm text-muted-foreground">
                      Put on sale
                    </label>
                    <div className="flex gap-3">
                      <Input
                        id="sell-price"
                        type="number"
                        min={0}
                        step="0.001"
                        placeholder="Enter ETH price"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                      />
                      <Button onClick={() => void runMutation(createSellOffer)}>List</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="token-name" className="text-sm text-muted-foreground">
                      Rename
                    </label>
                    <div className="flex gap-3">
                      <Input
                        id="token-name"
                        placeholder="Enter collector name"
                        value={tokenName}
                        onChange={(event) => setTokenName(event.target.value)}
                      />
                      <Button onClick={() => void runMutation(renameToken)}>Update</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {!userSellOffer && !userBuyOffer ? (
                    <div className="space-y-2">
                      <label htmlFor="bid-price" className="text-sm text-muted-foreground">
                        Make an offer
                      </label>
                      <div className="flex gap-3">
                        <Input
                          id="bid-price"
                          type="number"
                          min={0}
                          step="0.001"
                          placeholder="Enter ETH price"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                        />
                        <Button onClick={() => void runMutation(createBuyOffer)}>Bid</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your bid amount becomes the exact on-chain offer. Keep a little extra ETH in your wallet for gas.
                      </p>
                    </div>
                  ) : null}

                  {userSellOffer ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        void runMutation(async () => {
                          if (!publicClient || !address) {
                            throw new Error("Connect your wallet to continue.");
                          }

                          const { gas } = await prepareContractWrite({
                            publicClient,
                            account: address,
                            address: MARKET_ADDRESS,
                            abi: marketAbi,
                            functionName: "cancelSellOffer",
                            args: [BigInt(userSellOffer.offerId)]
                          });
                          const hash = await cancelSellOffer.writeContractAsync({
                            args: [BigInt(userSellOffer.offerId)],
                            gas
                          });
                          await publicClient.waitForTransactionReceipt({ hash });
                        })
                      }
                    >
                      Cancel sell offer
                    </Button>
                  ) : null}

                  {userBuyOffer ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        void runMutation(async () => {
                          if (!publicClient || !address) {
                            throw new Error("Connect your wallet to continue.");
                          }

                          const { gas } = await prepareContractWrite({
                            publicClient,
                            account: address,
                            address: MARKET_ADDRESS,
                            abi: marketAbi,
                            functionName: "cancelBuyOffer",
                            args: [BigInt(userBuyOffer.offerId)]
                          });
                          const hash = await cancelBuyOffer.writeContractAsync({
                            args: [BigInt(userBuyOffer.offerId)],
                            gas
                          });
                          await publicClient.waitForTransactionReceipt({ hash });
                        })
                      }
                    >
                      Cancel buy offer
                    </Button>
                  ) : null}

                  {!userSellOffer && !userBuyOffer && activeSellOffer && owner.toLowerCase() === MARKET_ADDRESS.toLowerCase() ? (
                    <Button onClick={() => void runMutation(acceptCurrentSellOffer)}>
                      Buy now for {formatEth(activeSellOffer.price)}
                    </Button>
                  ) : null}
                </div>
              )}
              {isMutating ? <p className="text-sm text-muted-foreground">Waiting for confirmation...</p> : null}
            </CardContent>
          </Card>

          <Card className="bg-card/65">
            <CardHeader>
              <CardTitle>Share and provenance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href).then(() => toast.success("Detail page copied."))
                }
              >
                Copy detail link
              </Button>
              <Button
                variant="outline"
                disabled={!imageZoomReady}
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
                disabled={!singleVideoReady}
                onClick={() =>
                  navigator.clipboard
                    .writeText(getAssetBySelection(nft.assets, theme, "singleVideo"))
                    .then(() => toast.success("Video link copied."))
                }
              >
                Copy video link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="market">
        <TabsList>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="collector-notes">Collector notes</TabsTrigger>
        </TabsList>
        <TabsContent value="market">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Order book</CardTitle>
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
                  {buyOffers.length ? (
                    buyOffers.map((offer) => (
                      <TableRow key={offer.offerId}>
                        <TableCell>{shortenAddress(offer.buyer)}</TableCell>
                        <TableCell>{formatEth(offer.price)}</TableCell>
                        <TableCell>{formatDateTimeFromUnix(offer.createdAtTimestamp)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No active bids yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card className="bg-card/70">
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
                  {nft.tokenHistory.length ? (
                    nft.tokenHistory.map((record, index) => (
                      <TableRow key={`${record.recordType}-${record.timestamp}-${index}`}>
                        <TableCell>{record.recordType === 1 ? "Mint" : "Transfer / Market"}</TableCell>
                        <TableCell>{shortenAddress(record.owner ?? record.buyer ?? record.seller ?? owner)}</TableCell>
                        <TableCell>{record.price ? formatEth(record.price) : "N/A"}</TableCell>
                        <TableCell>{formatDateTimeFromUnix(record.timestamp)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        {isPendingMetadata ? "History is still syncing." : "No history yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="collector-notes">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Collector notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">CC0 artwork</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  The artwork is public-domain, while ownership, provenance, and naming stay tied to the on-chain token.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Verified contracts</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Both the NFT and marketplace contracts are verified on Arbiscan for straightforward due diligence.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Media family</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Each token resolves into a still image and multiple motion studies, all derived from the same seed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(modal)} onOpenChange={(open) => {
        if (!open) {
          setModal(null);
          window.scrollTo({ top: 0 });
        } else {
          setModal(activeMedia);
        }
      }}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {modal ? `${mediaLabels[modal]} preview for ${formatId(nft.id)}` : `Preview for ${formatId(nft.id)}`}
          </DialogTitle>
          {modal === "image" && modalSource ? (
            <Image
              src={modalSource}
              alt={`Full-size artwork for NFT ${formatId(nft.id)}`}
              width={1600}
              height={1000}
              className="h-auto w-full"
              unoptimized
            />
          ) : modalSource ? (
            <video autoPlay controls className="max-h-[80vh] w-full" src={modalSource} />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
