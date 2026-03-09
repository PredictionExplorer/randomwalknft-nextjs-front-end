export type AnalyticsEvent =
  | "route_transition_start"
  | "wallet_connect_attempt"
  | "wallet_connect_success"
  | "wallet_connect_error"
  | "wallet_switch_network"
  | "marketplace_filter_changed"
  | "gallery_filter_changed"
  | "transaction_submitted"
  | "transaction_confirmed"
  | "transaction_failed"
  | "web_vital";

export type AnalyticsPayload = Record<string, number | string | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (!isBrowser()) {
    return;
  }

  const message = {
    event,
    ...payload
  };

  window.dataLayer?.push(message);
  window.dispatchEvent(new CustomEvent("randomwalk:analytics", { detail: message }));
}

export function trackWebVital(name: string, value: number, rating: string) {
  trackEvent("web_vital", {
    metric: name,
    value: Number(value.toFixed(2)),
    rating
  });
}
