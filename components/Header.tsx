import React, { useState, useEffect } from "react";
import Image from "next/image";

import {
  Toolbar,
  IconButton,
  Drawer,
  ListItem,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import NAV_SECTIONS from "../config/nav";
import ConnectWalletButton from "../components/ConnectWalletButton";

import { NavLink, AppBarWrapper, DrawerList } from "./styled";
import ListNavItem from  "./ListNavItem";
import ListItemButton from  "./ListItemButton";

const Header = () => {
  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });

  const { mobileView, drawerOpen } = state;

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 992
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };

    setResponsiveness();

    window.addEventListener("resize", () => setResponsiveness());

    return () => {
      window.removeEventListener("resize", () => setResponsiveness());
    };
  }, []);

  const renderDesktop = () => {
    return (
      <Toolbar disableGutters>
        <Image src="/images/logo2.png" width={93} height={93} alt="logo" />
        {NAV_SECTIONS.map((nav, i) => (
          <ListNavItem key={i} nav={nav} />
        ))}
        <ConnectWalletButton isMobileView={false} />
      </Toolbar>
    );
  };

  const renderMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: true }));
    const handleDrawerClose = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: false }));

    return (
      <Toolbar>
        <Image src="/images/logo2.png" width={93} height={93} alt="logo" />
        <IconButton
          aria-label="menu"
          aria-haspopup="true"
          edge="start"
          color="inherit"
          onClick={handleDrawerOpen}
          style={{ marginLeft: "auto" }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
          <DrawerList>
            <ListItem>
              <ConnectWalletButton isMobileView />
            </ListItem>
            {NAV_SECTIONS.map((nav, i) => (
              <ListItemButton key={i} nav={nav} sx={{ justifyContent: "center" }}>
                <NavLink href={nav.route}>{nav.title}</NavLink>
              </ListItemButton>
            ))}
            <ListItem>
              <NavLink href="/my-nfts">My NFTs</NavLink>
            </ListItem>
            <ListItem>
              <NavLink href="/my-offers">My Offers</NavLink>
            </ListItem>
          </DrawerList>
        </Drawer>
      </Toolbar>
    );
  };

  return (
    <AppBarWrapper position="fixed">
      <Container>{mobileView ? renderMobile() : renderDesktop()}</Container>
    </AppBarWrapper>
  );
};

export default Header;
