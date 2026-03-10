import "server-only";

import type { ZodSchema } from "zod";

import { API_BASE_URL, REVALIDATE_MEDIUM, RWALK_BASE_URL } from "@/lib/config";

type FetchInit = RequestInit & {
  revalidate?: number;
};

async function parseResponse<T>(
  response: Response,
  schema?: ZodSchema<T>
): Promise<T> {
  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as unknown;
  return schema ? schema.parse(data) : (data as T);
}

export async function fetchApi<T>(
  path: string,
  init: FetchInit = {},
  schema?: ZodSchema<T>
) {
  const { revalidate = REVALIDATE_MEDIUM, headers, ...rest } = init;

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`, {
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
  });

  return parseResponse(response, schema);
}

export async function fetchRwalk<T>(
  path: string,
  init: FetchInit = {},
  schema?: ZodSchema<T>
) {
  const { revalidate = REVALIDATE_MEDIUM, headers, ...rest } = init;

  const response = await fetch(`${RWALK_BASE_URL}/${path.replace(/^\/+/, "")}`, {
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
  });

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

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`, {
    ...rest,
    method: "POST",
    body,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers
    },
    cache: "no-store"
  });

  return parseResponse(response, schema);
}
