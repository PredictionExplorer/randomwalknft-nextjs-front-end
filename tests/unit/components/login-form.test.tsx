import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginForm } from "@/components/feature/login-form";

describe("LoginForm", () => {
  it("renders the login fields", () => {
    render(
      <LoginForm
        title="Log in"
        action={async () => ({})}
        footerHref="/auth/register"
        footerLabel="Register"
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders username when requested", () => {
    render(
      <LoginForm
        title="Register"
        action={async () => ({})}
        includeUsername
        footerHref="/auth/login"
        footerLabel="Log in"
      />
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });
});
