import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExternalLink } from "@/components/common/external-link";

describe("ExternalLink", () => {
  it("renders with target and rel attributes", () => {
    render(<ExternalLink href="https://example.com">Example</ExternalLink>);
    const link = screen.getByText("Example").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows icon when showIcon is true", () => {
    const { container } = render(
      <ExternalLink href="https://example.com" showIcon>Test</ExternalLink>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("hides icon by default", () => {
    const { container } = render(
      <ExternalLink href="https://example.com">Test</ExternalLink>
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
