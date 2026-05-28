import { z } from "zod"

export const signInSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
})

export const signUpSchema = signInSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer")
    .refine((p) => /[A-Z]/.test(p), "Password must contain at least one uppercase letter")
    .refine((p) => /[0-9]/.test(p), "Password must contain at least one number"),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>

/** Validates that an uploaded image file meets safety requirements. */
export const imageFileSchema = z.object({
  size: z
    .number()
    .max(5 * 1024 * 1024, "Image must be 5 MB or smaller"),
  type: z
    .string()
    .refine(
      (t) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(t),
      "Only JPEG, PNG, WebP and GIF images are allowed"
    ),
})
