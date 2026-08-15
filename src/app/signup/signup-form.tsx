"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/auth-actions";
import { Button, Field, FormError, Input } from "@/components/ui";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" type="text" required autoComplete="name" />
      </Field>

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </Field>

      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>

      {state?.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
