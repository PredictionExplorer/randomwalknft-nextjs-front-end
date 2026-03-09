import { trackEvent } from "@/lib/analytics";

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse"
) {
  trackEvent("route_transition_start", {
    navigationType,
    url
  });
}
