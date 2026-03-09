"use client";

import Link from "next/link";
import type { Route } from "next";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthAction = (
  state: { error?: string; success?: string } | null,
  formData: FormData
) => Promise<{ error?: string; success?: string }>;

export function LoginForm({
  title,
  action,
  includeUsername = false,
  footerHref,
  footerLabel
}: {
  title: string;
  action: AuthAction;
  includeUsername?: boolean;
  footerHref: Route;
  footerLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold tracking-[0.12em]">{title}</h1>
        <form action={formAction} className="space-y-5">
          {includeUsername ? (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting..." : title}
          </Button>
        </form>
        <Link href={footerHref} className="text-sm text-secondary underline underline-offset-4">
          {footerLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
