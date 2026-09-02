import "server-only";

import type { ZodType } from "zod";

import { isFetchConnectionError, rethrowAsBackendUnavailableIfConnectionFailed } from "@/lib/api/backend-errors";
import { BACKEND_RANDOMWALK_API_PREFIX, getBaseConfig, REVALIDATE_MEDIUM } from "@/lib/config";
import { getApiBaseUrls, markServerDown, rebaseUrl } from "@/lib/server-rotation";

/** Hung peers must never hang a page render; the rotation moves on instead. */
const UPSTREAM_TIMEOUT_MS = 10_000;

type FetchInit = RequestInit & {
  revalidate?: number;
};

/** A non-2xx answer from the Go API, with the status and (best-effort) parsed body attached. */
export class UpstreamHttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`Upstream request failed: ${status} ${statusText}`);
    this.name = "UpstreamHttpError";
    this.status = status;
    this.body = body;
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

async function parseResponse<T>(response: Response, schema?: ZodType<T>): Promise<T> {
  if (!response.ok) {
    throw new UpstreamHttpError(response.status, response.statusText, await readJson(response));
  }

  const data = (await response.json()) as unknown;
  return schema ? schema.parse(data) : (data as T);
}

function withTimeout(init: RequestInit): RequestInit {
  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  return {
    ...init,
    signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
  };
}

/**
 * Fetches from the current rotation pick (see `server-rotation.ts`). A connection
 * failure or timeout — or a 5xx when `retryOn5xx` is set — marks the picked server
 * down and moves on to the next server in the rotation, until every configured
 * server has been tried once.
 *
 * `retryOn5xx` is only used for GETs: a POST answered with 5xx may have been partially
 * processed, so replaying it on another server risks a double submit.
 */
async function fetchWithFailover(
  buildUrl: (origin: string) => string,
  init: RequestInit,
  retryOn5xx: boolean
): Promise<Response> {
  const { API_BASE_URL } = getBaseConfig();
  const peers = getApiBaseUrls();
  const attempts = Math.max(1, peers.length);

  let url = buildUrl(API_BASE_URL);
  let lastError: unknown;
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const origin = url === API_BASE_URL || url.startsWith(`${API_BASE_URL}/`) ? API_BASE_URL : originOf(url, peers);
    try {
      const response = await fetch(url, withTimeout(init));
      if (!(retryOn5xx && response.status >= 500)) {
        return response;
      }
      lastResponse = response;
      markServerDown(origin);
    } catch (error) {
      if (!isFetchConnectionError(error)) {
        throw error;
      }
      lastError = error;
      markServerDown(origin);
    }

    const nextUrl = rebaseUrl(url, peers);
    if (!nextUrl) {
      break;
    }
    url = nextUrl;
  }

  if (lastResponse) {
    // Every peer answered 5xx: surface the last one through the normal error path.
    return lastResponse;
  }
  return rethrowAsBackendUnavailableIfConnectionFailed(lastError);
}

function originOf(url: string, peers: string[]): string {
  return peers.find((base) => url === base || url.startsWith(`${base}/`)) ?? url;
}

function buildInit(init: FetchInit): RequestInit {
  const { revalidate = REVALIDATE_MEDIUM, headers, ...rest } = init;
  return {
    ...rest,
    headers: {
      Accept: "application/json",
      ...headers
    },
    ...(rest.cache === "no-store"
      ? {}
      : {
          next: {
            revalidate
          }
        })
  };
}

export async function fetchApi<T>(path: string, init: FetchInit = {}, schema?: ZodType<T>) {
  const response = await fetchWithFailover((origin) => `${origin}/${path.replace(/^\/+/, "")}`, buildInit(init), true);
  return parseResponse(response, schema);
}

export async function fetchRwalk<T>(path: string, init: FetchInit = {}, schema?: ZodType<T>) {
  const response = await fetchWithFailover(
    (origin) => `${origin}${BACKEND_RANDOMWALK_API_PREFIX}/${path.replace(/^\/+/, "")}`,
    buildInit(init),
    true
  );
  return parseResponse(response, schema);
}

export async function postApi<T>(
  path: string,
  body: BodyInit | FormData | null,
  init: FetchInit = {},
  schema?: ZodType<T>
) {
  const { headers, ...rest } = init;
  const isFormData = body instanceof FormData;

  const response = await fetchWithFailover(
    (origin) => `${origin}/${path.replace(/^\/+/, "")}`,
    {
      ...rest,
      method: "POST",
      body,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers
      },
      cache: "no-store"
    },
    false
  );
  return parseResponse(response, schema);
}
