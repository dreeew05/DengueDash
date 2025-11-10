import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    password_confirm: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    first_name: z.string().min(1, {
      message: "First Name is required.",
    }),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, {
      message: "Last Name is required.",
    }),
    sex: z.string({
      required_error: "Please select your sex.",
    }),
    region: z.string({
      required_error: "Please select your region.",
    }),
    surveillance_unit: z.string({
      required_error: "Please select your surveillance unit.",
    }),
    dru: z.string({
      required_error: "Please select your DRU.",
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match.",
    path: ["password_confirm"],
  });
