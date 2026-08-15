"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth-actions";
import { Button, Field, FormError, Input } from "@/components/ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>

      {state?.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
