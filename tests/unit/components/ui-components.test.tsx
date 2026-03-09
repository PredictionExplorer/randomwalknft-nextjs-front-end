import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CardDescription, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

describe("Card subcomponents", () => {
  it("renders CardDescription", () => {
    render(<CardDescription>Test description</CardDescription>);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders CardFooter", () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});

describe("SheetContent", () => {
  it("applies left positioning when side is left", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Left panel</SheetTitle>
          Left panel content
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const content = screen.getByText("Left panel content");
    expect(content).toBeInTheDocument();
    expect(content.closest("[class*='left-0']")).toBeInTheDocument();
  });
});

describe("DropdownMenuItem", () => {
  it("renders menu item when dropdown is open", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("menuitem", { name: /action item/i })).toBeInTheDocument();
  });
});
