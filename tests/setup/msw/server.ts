import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

/** Matches `NEXT_PUBLIC_API_BASE_URL` in `vitest.setup.tsx` (server module loads before env assign). */
const TEST_API_ORIGIN = "https://api.test.example.com";

const defaultHandlers = [
  http.get(`${TEST_API_ORIGIN}/api/randomwalk/contracts`, () =>
    HttpResponse.json({
      status: 1,
      error: "",
      marketplace_addr: "0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08",
      randomwalk_addr: "0x895a6F444BE4ba9d124F61DF736605792B35D66b"
    })
  )
];

export const server = setupServer(...defaultHandlers);
