/**
 * Deterministic stand-in for the Go API, the asset host, and the Arbitrum JSON-RPC
 * endpoint, so end-to-end tests never touch the network. Run with plain Node
 * (TypeScript is stripped natively). `POST /__mock/state` mutates the world for a
 * scenario; `POST /__mock/reset` restores it.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { handleJsonRpc } from "./rpc.ts";
import {
  artworkPng,
  MARKET_ADDRESS,
  mintTimestamp,
  NFT_ADDRESS,
  ownerOf,
  patchState,
  randomTokenIds,
  ratingOrder,
  resetState,
  seedFor,
  state
} from "./world.ts";

const PORT = Number(process.env.MOCK_UPSTREAM_PORT ?? 3900);
let requestCounter = 0;

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk: Buffer) => {
      data += chunk.toString("utf8");
    });
    request.on("end", () => resolve(data));
    request.on("error", reject);
  });
}

function json(response: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload, (_key, value: unknown) =>
    typeof value === "bigint" ? value.toString() : value
  );
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function tokenInfo(tokenId: number) {
  return {
    TokenInfo: {
      TokenId: tokenId,
      CurOwnerAddr: ownerOf(tokenId),
      SeedHex: seedFor(tokenId).slice(2),
      CurName: state.names[tokenId] ?? "",
      LastPrice: 0,
      TotalVolume: 0,
      NumTrades: 0
    }
  };
}

function tokenHistory(tokenId: number) {
  const mintedAt = mintTimestamp(tokenId);
  const records: Array<{ RecordType: number; Record: Record<string, unknown> }> = [
    {
      RecordType: 1,
      Record: {
        BlockNum: 1_000_000 + tokenId,
        TimeStamp: mintedAt,
        DateTime: new Date(mintedAt * 1000).toISOString(),
        OwnerAddr: ownerOf(tokenId),
        Price: 0.0069
      }
    }
  ];
  // Every third token changed hands once, so provenance timelines have a sale to show.
  if (tokenId % 3 === 0 && tokenId > 0) {
    const soldAt = mintedAt + 30 * 86_400;
    records.push({
      RecordType: 2,
      Record: {
        BlockNum: 1_000_000 + tokenId + 5,
        TimeStamp: soldAt,
        DateTime: new Date(soldAt * 1000).toISOString(),
        SellerAddr: ownerOf(tokenId + 1),
        BuyerAddr: ownerOf(tokenId),
        Price: 0.5
      }
    });
  }
  return { TokenHistory: records };
}

function serveAsset(request: IncomingMessage, response: ServerResponse, fileName: string) {
  const match = /^(\d{6})_(black|white)(\.png|_thumb\.jpg|_single\.mp4|_triple\.mp4)$/.exec(fileName);
  if (!match) {
    response.writeHead(404).end();
    return;
  }
  const tokenId = Number(match[1]);
  const edition = match[2] as "black" | "white";
  const kind = match[3]!;
  if (tokenId >= state.totalSupply || state.pendingTokens.includes(tokenId)) {
    response.writeHead(404, { "Cache-Control": "no-store" }).end();
    return;
  }
  if (kind.endsWith(".mp4")) {
    // No real films in the mock world: a 200 with an empty body keeps <video> harmless.
    response.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": "0", "Cache-Control": "no-store" });
    response.end();
    return;
  }
  const png = artworkPng(tokenId, edition, kind === "_thumb.jpg");
  response.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": String(png.length),
    "Cache-Control": "public, max-age=60",
    "Access-Control-Allow-Origin": "*"
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  response.end(Buffer.from(png));
}

async function handle(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname;
  requestCounter += 1;

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,HEAD,OPTIONS"
    });
    response.end();
    return;
  }

  // Scenario control.
  if (path === "/__mock/reset" && request.method === "POST") {
    resetState();
    json(response, 200, { ok: true });
    return;
  }
  if (path === "/__mock/state" && request.method === "POST") {
    patchState(JSON.parse((await readBody(request)) || "{}"));
    json(response, 200, { ok: true });
    return;
  }
  if (path === "/__mock/state" && request.method === "GET") {
    json(response, 200, state);
    return;
  }

  // JSON-RPC.
  if (path === "/rpc" && request.method === "POST") {
    const body = JSON.parse((await readBody(request)) || "{}");
    json(response, 200, handleJsonRpc(body));
    return;
  }

  // Assets.
  if (path.startsWith("/images/randomwalk/")) {
    serveAsset(request, response, path.slice("/images/randomwalk/".length));
    return;
  }

  // Go API.
  if (path.startsWith("/api/randomwalk/")) {
    const rest = path.slice("/api/randomwalk/".length);
    if (rest === "contracts") {
      json(response, 200, { status: 1, error: "", marketplace_addr: MARKET_ADDRESS, randomwalk_addr: NFT_ADDRESS });
      return;
    }
    const info = /^tokens\/info\/(\d+)$/.exec(rest);
    if (info) {
      const tokenId = Number(info[1]);
      if (tokenId >= state.totalSupply) {
        json(response, 404, { status: 0, error: "token not found" });
        return;
      }
      json(response, 200, tokenInfo(tokenId));
      return;
    }
    const history = /^tokens\/history\/(\d+)\/(\d+)\/(\d+)$/.exec(rest);
    if (history) {
      const tokenId = Number(history[1]);
      if (state.pendingTokens.includes(tokenId)) {
        json(response, 200, { TokenHistory: [] });
        return;
      }
      json(response, 200, tokenHistory(tokenId));
      return;
    }
    if (rest === "random") {
      // Fixed salt: the featured rails must be identical from one page load to the next.
      json(response, 200, randomTokenIds(24, 7));
      return;
    }
    if (rest === "rating_order") {
      json(response, 200, ratingOrder());
      return;
    }
    if (rest === "vote_count") {
      json(response, 200, { total_count: state.voteCount });
      return;
    }
    if (rest === "ranking/sign-challenge") {
      json(response, 200, { nonce: `nonce-${requestCounter}` });
      return;
    }
    if (rest.startsWith("ranking/beauty-pair-ids")) {
      // Stable between loads, different after every vote.
      const [first, second] = randomTokenIds(2, 101 + state.voteCount);
      json(response, 200, { token_ids: [first, second], pair_exhausted: false });
      return;
    }
    if (rest === "add_game" && request.method === "POST") {
      const body = JSON.parse((await readBody(request)) || "{}") as { signature?: string };
      if (!body.signature) {
        json(response, 400, { status: 0, error: "signature required" });
        return;
      }
      state.voteCount += 1;
      json(response, 200, { result: "success" });
      return;
    }
    json(response, 404, { status: 0, error: `unknown endpoint ${rest}` });
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("mock upstream: not found");
}

createServer((request, response) => {
  handle(request, response).catch((error: unknown) => {
    console.error("[mock-upstream]", error);
    if (!response.headersSent) {
      json(response, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });
}).listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console -- startup banner for the test runner log
  console.log(`[mock-upstream] listening on http://127.0.0.1:${PORT}`);
});
