import "server-only";

import type { ZodSchema } from "zod";

import { isFetchConnectionError, rethrowAsBackendUnavailableIfConnectionFailed } from "@/lib/api/backend-errors";
import { BACKEND_RANDOMWALK_API_PREFIX, getBaseConfig, REVALIDATE_MEDIUM } from "@/lib/config";
import { getApiBaseUrls, markServerDown, rebaseUrl } from "@/lib/server-rotation";

type FetchInit = RequestInit & {
  revalidate?: number;
};

async function parseResponse<T>(response: Response, schema?: ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as unknown;
  return schema ? schema.parse(data) : (data as T);
}

/**
 * Fetches from the current rotation pick (see `server-rotation.ts`). On a connection
 * failure — or a 5xx when `retryOn5xx` is set — the picked server is marked down and the
 * request is retried once against the next server in the rotation.
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
  const url = buildUrl(API_BASE_URL);

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (e) {
    if (!isFetchConnectionError(e)) {
      throw e;
    }
    markServerDown(API_BASE_URL);
    const retryUrl = rebaseUrl(url, getApiBaseUrls());
    if (!retryUrl) {
      rethrowAsBackendUnavailableIfConnectionFailed(e);
    }
    try {
      return await fetch(retryUrl, init);
    } catch (e2) {
      rethrowAsBackendUnavailableIfConnectionFailed(e2);
    }
  }

  if (retryOn5xx && response.status >= 500) {
    markServerDown(API_BASE_URL);
    const retryUrl = rebaseUrl(url, getApiBaseUrls());
    if (retryUrl) {
      try {
        return await fetch(retryUrl, init);
      } catch {
        // Keep the original 5xx response; parseResponse turns it into the normal error.
      }
    }
  }

  return response;
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

export async function fetchApi<T>(path: string, init: FetchInit = {}, schema?: ZodSchema<T>) {
  const response = await fetchWithFailover((origin) => `${origin}/${path.replace(/^\/+/, "")}`, buildInit(init), true);
  return parseResponse(response, schema);
}

export async function fetchRwalk<T>(path: string, init: FetchInit = {}, schema?: ZodSchema<T>) {
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
  schema?: ZodSchema<T>
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
