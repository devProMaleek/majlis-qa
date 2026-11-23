"use client";

import { useActionState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/app/auth/actions";
import {
  signInSchema,
  type AuthActionState,
  type SignInValues,
} from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignInForm({ configured }: { configured: boolean }) {
  const [state, dispatch, pending] = useActionState<AuthActionState, FormData>(
    signIn,
    { message: "" },
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const emailError = errors.email?.message ?? state.errors?.email;
  const passwordError = errors.password?.message ?? state.errors?.password;
  return (
    <form
      action={dispatch}
      onSubmit={handleSubmit((values) => {
        const data = new FormData();
        data.set("email", values.email);
        data.set("password", values.password);
        startTransition(() => dispatch(data));
      })}
      className="flex flex-col gap-5"
      aria-label="Staff sign-in"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(emailError)}>
          <FieldLabel htmlFor="staff-email">Email address</FieldLabel>
          <Input
            {...register("email")}
            id="staff-email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            disabled={pending || !configured}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && <FieldError id="email-error">{emailError}</FieldError>}
        </Field>
        <Field data-invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor="staff-password">Password</FieldLabel>
          <Input
            {...register("password")}
            id="staff-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={1024}
            disabled={pending || !configured}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError && (
            <FieldError id="password-error">{passwordError}</FieldError>
          )}
        </Field>
      </FieldGroup>
      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      {!configured && (
        <Alert role="note">
          <AlertDescription>
            Staff sign-in has not been configured yet. Contact the person
            setting up this installation.
          </AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending || !configured}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="body-copy">
        Need access? Contact your organisation administrator. Attendees do not
        need an account.
      </p>
    </form>
  );
}
