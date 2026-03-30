import type { RequiredEnvKey } from "@/lib/env";

type EnvMissingPageProps = {
  missingKeys: readonly RequiredEnvKey[];
};

export function EnvMissingPage({ missingKeys }: EnvMissingPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        background: "#0a0a0c",
        color: "#e4e4e7"
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        Environment variables are not set
      </h1>
      <p style={{ maxWidth: "36rem", textAlign: "center", marginBottom: "1.25rem", lineHeight: 1.6 }}>
        This application cannot continue until all required variables are defined (e.g. in{" "}
        <code style={{ color: "#a78bfa" }}>.env.local</code>). Copy{" "}
        <code style={{ color: "#a78bfa" }}>.env.example</code> and fill in every value.
      </p>
      <p style={{ fontSize: "0.875rem", color: "#a1a1aa", marginBottom: "0.75rem" }}>
        Missing or empty:
      </p>
      <ul
        style={{
          textAlign: "left",
          fontSize: "0.875rem",
          fontFamily: "ui-monospace, monospace",
          color: "#fca5a5",
          listStyle: "disc",
          paddingLeft: "1.25rem"
        }}
      >
        {missingKeys.map((key) => (
          <li key={key}>{key}</li>
        ))}
      </ul>
    </div>
  );
}
