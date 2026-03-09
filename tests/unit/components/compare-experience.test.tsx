import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { CompareExperience } from "@/components/feature/compare-experience";
import { server } from "../../setup/msw/server";

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("CompareExperience", () => {
  it("renders loading skeleton initially", () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [1, 2], totalCount: 42 })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });
    expect(screen.getByText("WHICH")).toBeInTheDocument();
  });

  it("renders two pick buttons after data loads", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [10, 20], totalCount: 5 })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });

    expect(await screen.findByText("Pick 10")).toBeInTheDocument();
    expect(screen.getByText("Pick 20")).toBeInTheDocument();
    expect(screen.getByText("5 votes")).toBeInTheDocument();
  });

  it("submits a vote when pick button is clicked", async () => {
    let votedPayload: unknown = null;

    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [3, 7], totalCount: 10 })
      ),
      http.post("/api/compare", async ({ request }) => {
        votedPayload = await request.json();
        return HttpResponse.json({});
      })
    );

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });

    const pickButton = await screen.findByText("Pick 3");
    await user.click(pickButton);

    expect(votedPayload).toEqual({ firstId: 3, secondId: 7, winner: 3 });
  });

  it("returns null when tokenIds array is empty", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [], totalCount: 0 })
      )
    );

    const { container } = render(<CompareExperience />, { wrapper: Wrapper });
    await vi.waitFor(() => {
      expect(container.querySelector("[class*='space-y-8']")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when vote fails", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [5, 8], totalCount: 3 })
      ),
      http.post("/api/compare", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });

    const pickButton = await screen.findByText("Pick 5");
    await user.click(pickButton);

    await vi.waitFor(() => {
      expect(pickButton).not.toBeDisabled();
    });
  });

  it("throws when fetch response is not ok", async () => {
    server.use(
      http.get("/api/compare", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });
    expect(screen.getByText("WHICH")).toBeInTheDocument();
  });
});
