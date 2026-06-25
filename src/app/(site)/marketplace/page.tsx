import { permanentRedirect } from "next/navigation";

import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";

export default function MarketplacePage() {
  permanentRedirect(AXIOM_ZERO_MARKETPLACE_URL);
}
