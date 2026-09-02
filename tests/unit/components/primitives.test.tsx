import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("Breadcrumbs", () => {
  it("renders the trail with the current page unlinked and BreadcrumbList JSON-LD", () => {
    const { container } = render(
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { href: "/gallery", label: "Collection" }, { label: "#000042" }]}
      />
    );
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Collection" })).toHaveAttribute("href", "/gallery");
    expect(screen.queryByRole("link", { name: "#000042" })).not.toBeInTheDocument();

    const jsonLd = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent) as {
      "@type": string;
      itemListElement: Array<{ position: number; name: string; item?: string }>;
    };
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement[1]).toMatchObject({ position: 2, name: "Collection" });
    expect(jsonLd.itemListElement[1]!.item).toMatch(/\/gallery$/);
    expect(jsonLd.itemListElement[2]!.item).toBeUndefined();
  });
});

describe("JsonLd", () => {
  it("serialises structured data into a script tag", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "x" }} />);
    expect(container.querySelector("script")?.textContent).toBe('{"@type":"Thing","name":"x"}');
  });
});

describe("Accordion", () => {
  it("expands one item at a time", async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>First body</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Second body</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText("First body")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "First" }));
    expect(screen.getByText("First body")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByText("Second body")).toBeVisible();
    expect(screen.queryByText("First body")).not.toBeInTheDocument();
  });
});

describe("Tabs", () => {
  it("switches panels", async () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Panel one</TabsContent>
        <TabsContent value="two">Panel two</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Panel one")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByText("Panel two")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Table and Separator", () => {
  it("render semantic markup", () => {
    render(
      <>
        <Separator decorative={false} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>#000001</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Token" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "#000001" })).toBeInTheDocument();
  });
});
