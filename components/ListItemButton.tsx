import React, { useState } from "react";
import { ListItem, Collapse, List } from "@mui/material";
import { NavLink } from "./styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const ListItemButton = (props) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      {props.nav.children ? (
        <ListItem onClick={handleClick}>
          <NavLink display="flex">
            {props.nav.title}
            {open ? <ExpandLess /> : <ExpandMore />}
          </NavLink>
        </ListItem>
      ) : (
        <ListItem>
          <NavLink href={props.nav.route}>{props.nav.title}</NavLink>
        </ListItem>
      )}
      {props.nav.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {props.nav.children.map((nav, i) => (
              <ListItem sx={{ pl: 4 }} key={i}>
                <NavLink href={nav.route}>{nav.title}</NavLink>
              </ListItem>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default ListItemButton;
