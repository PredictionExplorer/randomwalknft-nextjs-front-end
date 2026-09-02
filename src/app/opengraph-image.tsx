import { connection } from "next/server";
import { ImageResponse } from "next/og";

import { getVaultState } from "@/lib/api/public";
import { getSiteConfig } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

/** Every shared link doubles as a billboard for the live game state. */
export default async function OpenGraphImage() {
  // Rendered per request so the vault figures on the card are current.
  await connection();
  const { SITE_NAME } = getSiteConfig();
  const vault = await getVaultState().catch(() => null);
  const days = vault ? Math.max(0, Math.floor(vault.secondsUntilWithdrawal / 86_400)) : null;
  const hours = vault ? Math.max(0, Math.floor((vault.secondsUntilWithdrawal % 86_400) / 3_600)) : null;

  const stats = vault
    ? [
        { label: "IN THE VAULT", value: `${vault.prizeEth.toFixed(2)} ETH` },
        {
          label: "VAULT OPENS IN",
          value: vault.secondsUntilWithdrawal <= 0 ? "OPEN NOW" : `${days}d ${hours}h`
        },
        { label: "WORKS MINTED", value: vault.mintedCount.toLocaleString("en-US") }
      ]
    : [];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "radial-gradient(circle at top left, rgba(198,118,215,0.35), transparent 40%), radial-gradient(circle at bottom right, rgba(155,74,175,0.25), transparent 45%), linear-gradient(180deg, #09090b, #050505)",
        color: "white",
        padding: "64px"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 30, color: "#c676d7", letterSpacing: "0.35em" }}>A LIVING MUSEUM OF GENERATIVE ART</div>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "0.14em", marginTop: 18 }}>
          {SITE_NAME.toUpperCase()}
        </div>
        <div style={{ maxWidth: 900, marginTop: 20, fontSize: 30, color: "#e8c9f2", lineHeight: 1.4 }}>
          Every mint draws a unique artwork from an on-chain seed — and the last minter standing takes half the vault.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 56 }}>
          {stats.map((item) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22, color: "#9b8ba3", letterSpacing: "0.25em" }}>{item.label}</div>
              <div style={{ fontSize: 46, fontWeight: 700, color: "#f4bfff", marginTop: 8 }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, color: "#9b8ba3" }}>randomwalknft.com</div>
      </div>
    </div>,
    size
  );
}
