"use client";

import { useActionState } from "react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/schemas";

export function SignOutForm() {
  const [state, action, pending] = useActionState<AuthActionState>(signOut, {
    message: "",
  });
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {state.message && (
        <p role="alert" className="body-copy">
          {state.message}
        </p>
      )}
    </form>
  );
}
