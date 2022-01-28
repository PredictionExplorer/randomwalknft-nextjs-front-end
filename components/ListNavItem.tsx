import React, { useState } from "react";
import { Menu, MenuItem, Box } from "@mui/material";
import { NavLink } from "./styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const ListNavItem = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box ml={3}>
        {props.nav.children ? (
          <NavLink href="#" onClick={handleMenuOpen} display="flex" alignItems="center">
            {props.nav.title}
            {anchorEl ? <ExpandLess /> : <ExpandMore />}
          </NavLink>
        ) : (
          <NavLink href={props.nav.route}>{props.nav.title}</NavLink>
        )}
      </Box>
      {props.nav.children && (
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
          {props.nav.children.map((nav, i) => (
            <MenuItem
              key={i}
              style={{ minWidth: 166 }}
              onClick={handleMenuClose}
            >
              <NavLink href={nav.route}>{nav.title}</NavLink>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default ListNavItem;
