import { z } from "zod";

export const reportFormSchema = z
  .object({
    first_name: z.string().min(1, "First Name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last Name is required"),
    suffix: z.string().optional(),
    sex: z.enum(["F", "M"]).refine((val) => val !== undefined, {
      message: "Sex is required",
    }),
    civil_status: z
      .enum(["S", "M", "SEP", "W"])
      .refine((val) => val !== undefined, {
        message: "Civil Status is required",
      }),
    date_of_birth: z.date({ required_error: "Date of Birth is required" }),
    addr_house_no: z.number().optional(),
    addr_street: z.string().optional(),
    addr_barangay: z.string().min(1, "Barangay is required"),
    addr_city: z.string().min(1, "City is required"),
    addr_province: z.string().min(1, "Province is required"),
    addr_region: z.string().min(1, "Region is required"),
    date_first_vax: z.date().optional(),
    date_last_vax: z.date().optional(),
    date_con: z.date({ required_error: "Date of Consultation is required" }),
    is_admt: z.string(),
    date_onset: z.date({
      required_error: "Date of Onset Illness is required",
    }),
    clncl_class: z.enum(["N", "W", "S"]),
    ns1_result: z.enum(["P", "N", "E", "PR"]).default("PR"),
    date_ns1: z.date().optional(),
    igg_elisa: z.enum(["P", "N", "E", "PR"]).default("PR"),
    date_igg_elisa: z.date().optional(),
    igm_elisa: z.enum(["P", "N", "E", "PR"]).default("PR"),
    date_igm_elisa: z.date().optional(),
    pcr: z.enum(["P", "N", "E", "PR"]).default("PR"),
    date_pcr: z.date().optional(),
    case_class: z.enum(["C", "P", "S"]),
    outcome: z.enum(["A", "D"]),
    date_death: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ns1_result !== "PR" && !data.date_ns1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_ns1"],
        message: "NS1 Date is required",
      });
    }

    if (data.igg_elisa !== "PR" && !data.date_igg_elisa) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_igg_elisa"],
        message: "IgG Elisa Date is required",
      });
    }

    if (data.igm_elisa !== "PR" && !data.date_igm_elisa) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_igm_elisa"],
        message: "IgM Elisa Date is required",
      });
    }

    if (data.pcr !== "PR" && !data.date_pcr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_pcr"],
        message: "PCR Date is required",
      });
    }

    if (data.outcome === "D" && !data.date_death) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_death"],
        message: "Date of Death is required",
      });
    }
  });

export type ReportFormValues = z.infer<typeof reportFormSchema>;
