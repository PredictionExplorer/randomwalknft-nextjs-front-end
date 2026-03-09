import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeading } from "@/components/common/page-heading";

describe("PageHeading", () => {
  it("renders title parts", () => {
    render(
      <PageHeading
        title={[
          { text: "Hello" },
          { text: "World" }
        ]}
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(
      <PageHeading
        eyebrow="Featured"
        title={[{ text: "Title" }]}
      />
    );

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <PageHeading
        title={[{ text: "Title" }]}
        description="A short description of the page."
      />
    );

    expect(screen.getByText("A short description of the page.")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    render(
      <PageHeading
        title={[{ text: "Title" }]}
      />
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("applies primary tone style", () => {
    render(
      <PageHeading
        title={[{ text: "Primary", tone: "primary" }]}
      />
    );

    const span = screen.getByText("Primary");
    expect(span).toHaveClass("text-primary");
  });

  it("applies secondary tone style", () => {
    render(
      <PageHeading
        title={[{ text: "Secondary", tone: "secondary" }]}
      />
    );

    const span = screen.getByText("Secondary");
    expect(span).toHaveClass("text-secondary");
  });

  it("applies default tone when tone is omitted", () => {
    render(
      <PageHeading
        title={[{ text: "Default" }]}
      />
    );

    const span = screen.getByText("Default");
    expect(span).toHaveClass("text-foreground");
  });

  it("applies center alignment classes when align is center", () => {
    const { container } = render(
      <PageHeading
        eyebrow="Test eyebrow"
        title={[{ text: "TITLE" }]}
        description="Centered description"
        align="center"
      />
    );
    expect(container.querySelector(".text-center")).toBeInTheDocument();
  });
});
