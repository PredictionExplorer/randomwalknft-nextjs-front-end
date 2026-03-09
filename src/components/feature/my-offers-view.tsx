"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWriteMarketCancelBuyOffer, useWriteMarketCancelSellOffer } from "@/generated/wagmi";
import { getErrorMessage } from "@/lib/web3/errors";
import { formatEth, formatId } from "@/lib/utils";

const offerItemSchema = z.object({
  offerId: z.number(),
  tokenId: z.number(),
  price: z.number(),
  kind: z.enum(["buy", "sell"])
});

const offerResponseSchema = z.object({
  buyOffers: z.array(offerItemSchema),
  sellOffers: z.array(offerItemSchema)
});

type OfferResponse = z.infer<typeof offerResponseSchema>;

async function fetchOffers(account: string): Promise<OfferResponse> {
  const response = await fetch(`/api/offers?account=${account}`);
  if (!response.ok) {
    throw new Error("Failed to load offers.");
  }

  const data: unknown = await response.json();
  return offerResponseSchema.parse(data);
}

export function MyOffersView() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const offersQuery = useQuery({
    queryKey: ["account-offers", address],
    queryFn: () => fetchOffers(address!),
    enabled: Boolean(address)
  });
  const buyMutation = useWriteMarketCancelBuyOffer();
  const sellMutation = useWriteMarketCancelSellOffer();

  const offers = [...(offersQuery.data?.buyOffers ?? []), ...(offersQuery.data?.sellOffers ?? [])].sort(
    (left, right) => left.offerId - right.offerId
  );

  const handleCancel = async (offerId: number, kind: "buy" | "sell") => {
    try {
      const hash =
        kind === "buy"
          ? await buyMutation.writeContractAsync({ args: [BigInt(offerId)] })
          : await sellMutation.writeContractAsync({ args: [BigInt(offerId)] });

      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success("Offer cancelled.");
      await offersQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageShell className="space-y-8 py-16">
      <PageHeading title={[{ text: "MY OFFERS", tone: "primary" }]} />
      {!isConnected ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">Connect your wallet to load your offers.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length ? (
                  offers.map((offer) => (
                    <TableRow key={`${offer.kind}-${offer.offerId}`}>
                      <TableCell>{offer.kind.toUpperCase()}</TableCell>
                      <TableCell>
                        <Link href={`/detail/${offer.tokenId}` as Route} className="text-secondary transition hover:text-primary">
                          {formatId(offer.tokenId)}
                        </Link>
                      </TableCell>
                      <TableCell>{formatEth(offer.price)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => void handleCancel(offer.offerId, offer.kind)}>
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No offers yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
