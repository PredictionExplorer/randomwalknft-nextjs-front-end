import { Contract, ContractInterface } from "@ethersproject/contracts";
import { useEffect, useMemo, useState } from "react";
import { getNetworkLibrary } from "../connectors";

/**
 * React hook that returns a **read-only** ethers.js `Contract` instance.
 *
 * ⚠️ Because the contract is connected to a provider—not a signer—only
 * constant/view methods can be called (no gas-spending writes).
 *
 * @template T  Contract subclass the caller expects (defaults to `Contract`)
 * @param address  Target contract address (hex string, checksum-formatted)
 * @param ABI      Contract ABI (array/fragments or JSON string)
 * @returns        A memoised contract instance or `null` until ready
 */
export default function useContractNoSigner<T extends Contract = Contract>(
  address: string,
  ABI: ContractInterface
): T | null {
  const library = getNetworkLibrary(); // RPC provider (no signer)
  const [byteCode, setByteCode] = useState<string>("");

  useEffect(() => {
    if (!library || !address) return;

    let cancelled = false;

    const fetchByteCode = async (addr: string) => {
      try {
        const code = await library.getCode(addr); // "0x" when not a contract
        if (!cancelled) setByteCode(code);
      } catch (err) {
        console.error("useContractNoSigner → getCode error:", err);
        if (!cancelled) setByteCode("");
      }
    };

    fetchByteCode(address);

    /*  Cleanup so we don’t try to set state after unmount */
    return () => {
      cancelled = true;
    };
  }, [address, library]);

  return useMemo(() => {
    // Bail out until we have enough information *and* the target is a contract
    if (!address || !ABI || !library || byteCode.length <= 2) return null;

    try {
      // Plain provider → read-only contract (no signer attached)
      return new Contract(address, ABI, library) as T;
    } catch (err) {
      console.error("useContractNoSigner → contract init error:", err);
      return null;
    }
  }, [address, ABI, library, byteCode]);
}
