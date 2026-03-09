import type { Metadata } from "next";

import { LoginForm } from "@/components/feature/login-form";
import { PageShell } from "@/components/common/page-shell";
import { registerAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Register"
};

export default function RegisterPage() {
  return (
    <PageShell className="py-16">
      <LoginForm
        title="Register"
        action={registerAction}
        includeUsername
        footerHref="/auth/login"
        footerLabel="Already have an account? Log in"
      />
    </PageShell>
  );
}
