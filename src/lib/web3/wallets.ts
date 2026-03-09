type WalletConnectorLike = {
  uid: string;
  id?: string;
  name: string;
};

export type WalletOption = {
  connector: WalletConnectorLike;
  description: string;
  label: string;
};

export function getWalletLabel(connector: WalletConnectorLike) {
  const id = connector.id?.toLowerCase() ?? "";
  const name = connector.name.toLowerCase();

  if (id.includes("coinbase") || name.includes("coinbase")) {
    return "Coinbase Wallet";
  }

  if (id.includes("metamask") || name.includes("metamask")) {
    return "MetaMask";
  }

  if (id.includes("safe") || name.includes("safe")) {
    return "Safe";
  }

  if (id.includes("injected") || name.includes("injected")) {
    return "Browser Wallet";
  }

  return connector.name;
}

export function getWalletDescription(connector: WalletConnectorLike) {
  const label = getWalletLabel(connector);

  if (label === "Browser Wallet") {
    return "Connect using your installed wallet extension.";
  }

  if (label === "MetaMask") {
    return "Connect with MetaMask in your browser.";
  }

  if (label === "Coinbase Wallet") {
    return "Connect with the Coinbase Wallet browser extension.";
  }

  return `Connect with ${label}.`;
}

export function getWalletOptions<TConnector extends WalletConnectorLike>(connectors: TConnector[]) {
  const seen = new Set<string>();

  return connectors.reduce<Array<WalletOption & { connector: TConnector }>>((result, connector) => {
    const label = getWalletLabel(connector);
    if (seen.has(label)) {
      return result;
    }

    seen.add(label);
    result.push({
      connector,
      label,
      description: getWalletDescription(connector)
    });
    return result;
  }, []);
}
