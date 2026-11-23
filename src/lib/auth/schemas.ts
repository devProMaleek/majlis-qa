import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email({ error: "Enter a valid email address." })),
  // Sign-in accepts existing passwords; account-creation rules belong to Supabase Auth.
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(1024, "Password is too long."),
});
export type SignInValues = z.infer<typeof signInSchema>;
export type AuthActionState = {
  message: string;
  errors?: { email?: string; password?: string };
};
