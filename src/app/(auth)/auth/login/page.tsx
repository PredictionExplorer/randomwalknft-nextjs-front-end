import type { Metadata } from "next";

import { LoginForm } from "@/components/feature/login-form";
import { PageShell } from "@/components/common/page-shell";
import { loginAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <PageShell className="py-16">
      <LoginForm title="Log in" action={loginAction} footerHref="/auth/register" footerLabel="Need an account? Register" />
    </PageShell>
  );
}
