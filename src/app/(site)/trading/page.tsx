import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Pager } from "@/components/common/pager";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTradingHistory } from "@/lib/api/public";
import { formatDateTimeFromUnix, formatEth, formatId, shortenAddress } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trading History"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TradingPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const { tradingHistory, totalCount } = await getTradingHistory(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const params = new URLSearchParams();
  if (safePage > 1) {
    params.set("page", String(safePage));
  }

  return (
    <PageShell className="space-y-8 py-16">
      <PageHeading
        title={[
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFT" },
          { text: "TRADING HISTORY", tone: "secondary" }
        ]}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradingHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Link href={`/detail/${entry.tokenId}` as Route} className="text-secondary transition hover:text-primary">
                      {formatId(entry.tokenId)}
                    </Link>
                  </TableCell>
                  <TableCell>{shortenAddress(entry.seller)}</TableCell>
                  <TableCell>{shortenAddress(entry.buyer)}</TableCell>
                  <TableCell>{formatEth(entry.price)}</TableCell>
                  <TableCell>{formatDateTimeFromUnix(entry.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pager pathname="/trading" page={safePage} totalPages={totalPages} searchParams={params} />
    </PageShell>
  );
}
