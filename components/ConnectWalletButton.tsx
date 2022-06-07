import React, { useCallback, useState } from "react";
import { MenuItem, Menu, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { isMobile } from "react-device-detect";

import {
  NavLink,
  MobileWallet,
  Wallet,
  ConnectButton,
  MobileConnectButton,
} from "./styled";
import { injected, walletconnect } from "../connectors";
import { useActiveWeb3React } from "../hooks/web3";
import { shortenHex } from "../utils";
import { switchNetwork } from "../utils/switchNetwork";

const ConnectWalletButton = ({ isMobileView }) => {
  const { account, activate } = useActiveWeb3React();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleConnectWallet = useCallback(async () => {
    const connector = isMobile ? walletconnect : injected;
    await activate(connector, async (err) => {
      if (
        err.name === "UnsupportedChainIdError" &&
        window.confirm("Switch to the Arbitrum network?")
      ) {
        await switchNetwork();
        window.location.reload();
      }
    });
  }, [activate]);

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };

  if (account) {
    return isMobileView ? (
      <MobileWallet
        variant="outlined"
        color="secondary"
        label={
          <Box display="flex" alignItems="center">
            {shortenHex(account)}
          </Box>
        }
        onClick={handleMenuOpen}
      />
    ) : (
      <>
        <Wallet
          variant="outlined"
          color="secondary"
          label={
            <Box display="flex" alignItems="center">
              {shortenHex(account)} <ExpandMoreIcon />
            </Box>
          }
          deleteIcon={<ExpandMoreIcon />}
          onClick={handleMenuOpen}
        />
        <Menu
          elevation={0}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/admin">ADMIN</NavLink>
          </MenuItem>
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/my-nfts">MY NFTS</NavLink>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <NavLink href="/my-offers">MY OFFERS</NavLink>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return isMobileView ? (
    <MobileConnectButton
      variant="outlined"
      color="secondary"
      size="large"
      onClick={handleConnectWallet}
    >
      Connect to wallet
    </MobileConnectButton>
  ) : (
    <ConnectButton
      variant="outlined"
      color="secondary"
      size="large"
      onClick={handleConnectWallet}
    >
      Connect to wallet
    </ConnectButton>
  );
};

export default ConnectWalletButton;
