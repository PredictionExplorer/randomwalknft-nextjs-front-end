import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TermTooltip } from "@/components/common/term-tooltip";

describe("TermTooltip", () => {
  it("connects the trigger term to its definition", () => {
    render(
      <TermTooltip
        id="gesture"
        term="gesture"
        definition="A protocol action made during a Cosmic Signature Performance Cycle."
      />
    );

    const trigger = screen.getByRole("button", { name: "gesture" });
    const tooltip = screen.getByRole("tooltip");

    expect(trigger).toHaveAttribute("aria-describedby", "gesture-definition");
    expect(tooltip).toHaveAttribute("id", "gesture-definition");
    expect(tooltip).toHaveTextContent("Performance Cycle");
  });
});
