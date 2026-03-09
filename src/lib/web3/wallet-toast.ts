import { toast } from "sonner";

import { classifyWalletError } from "@/lib/web3/errors";

export function showWalletError(error: unknown) {
  const { message, severity } = classifyWalletError(error);

  switch (severity) {
    case "info":
      toast.info(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    case "error":
      toast.error(message);
      break;
  }
}
