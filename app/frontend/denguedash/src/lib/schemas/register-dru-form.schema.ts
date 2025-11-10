import { z } from "zod";

export const registerDRUSchema = z.object({
  dru_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  addr_street: z.string().min(1, "Street is required"),
  addr_barangay: z.string().min(1, "Barangay is required"),
  addr_city: z.string().min(1, "City is required"),
  addr_province: z.string().min(1, "Province is required"),
  region: z.string().min(1, "Region is required"),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contact_number: z.string().min(7, {
    message: "Contact number must be at least 7 characters.",
  }),
  dru_type: z.string({
    required_error: "Please select a DRU type.",
  }),
});
