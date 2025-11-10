"use client";

import { Separator } from "@/shadcn/components/ui/separator";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reportFormSchema,
  ReportFormValues,
} from "@/lib/schemas/case-report-form.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import { Form } from "@/shadcn/components/ui/form";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import { PersonalDetailSection } from "@/components/case-report-form/PersonalDetailSection";
import { AddressSection } from "@/components/case-report-form/AddressSection";
import { VaccinationSection } from "@/components/case-report-form/VaccinationSection";
import { LaboratoryResultsSection } from "@/components/case-report-form/LaboratoryResultsSection";
import { ConsultationSection } from "@/components/case-report-form/ConsultationSection";
import { OutcomeSection } from "@/components/case-report-form/OutcomeSection";
import postService from "@/services/post.service";
import {
  BaseErrorResponse,
  BaseServiceResponse,
  ReportFormResponse,
} from "@/interfaces/services/services.interface";
import { Upload } from "lucide-react";
import { BulkUploadModal } from "@/components/case-report-form/BulkUploadModal";

export default function CaseReportForm() {
  const [currentPage, setCurrentPage] = useState<"personal" | "clinical">(
    "personal"
  );
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  // Initialize the form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      addr_barangay: "",
      addr_city: "",
      addr_province: "",
      addr_region: "",
      ns1_result: "PR",
      igg_elisa: "PR",
      igm_elisa: "PR",
      pcr: "PR",
    },
  });

  // Handle form submission
  const onSubmit = async (values: ReportFormValues) => {
    // todo: Process form data here
    const formatDate = (dateString: string | number | Date) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const formatAddress = (address: string) => {
      return address.split("|")[0];
    };
    const formattedValues = {
      patient: {
        first_name: values.first_name,
        middle_name: values.middle_name,
        last_name: values.last_name,
        suffix: values.suffix,
        date_of_birth: formatDate(values.date_of_birth),
        sex: values.sex,
        addr_house_no: values.addr_house_no,
        addr_street: values.addr_street,
        addr_barangay: values.addr_barangay,
        addr_city: formatAddress(values.addr_city),
        addr_province: formatAddress(values.addr_province),
        addr_region: formatAddress(values.addr_region),
        civil_status: values.civil_status,
        date_first_vax: values.date_first_vax
          ? formatDate(values.date_first_vax)
          : null,
        date_last_vax: values.date_last_vax
          ? formatDate(values.date_last_vax)
          : null,
      },
      date_onset: formatDate(values.date_onset),
      date_con: formatDate(values.date_con),
      is_admt: values.is_admt === "true" ? true : false,
      clncl_class: values.clncl_class,
      ns1_result: values.ns1_result,
      date_ns1: values.date_ns1 ? formatDate(values.date_ns1) : null,
      igg_elisa: values.igg_elisa,
      date_igg_elisa: values.date_igg_elisa
        ? formatDate(values.date_igg_elisa)
        : null,
      igm_elisa: values.igm_elisa,
      date_igm_elisa: values.date_igm_elisa
        ? formatDate(values.date_igm_elisa)
        : null,
      pcr: values.pcr,
      date_pcr: values.date_pcr ? formatDate(values.date_pcr) : null,
      case_class: values.case_class,
      outcome: values.outcome,
      date_death: values.date_death ? formatDate(values.date_death) : null,
    };

    console.log("Formatted Values:", formattedValues);

    // Send the data to the server
    const response:
      | BaseServiceResponse
      | BaseErrorResponse
      | ReportFormResponse = await postService.submitForm(formattedValues);
    const handleErrors = (message: Record<string, any>) => {
      const processErrors = (errors: Record<string, any>) => {
        Object.entries(errors).forEach(([field, errorMessages]) => {
          (errorMessages as string[]).forEach((error: string) => {
            console.error("Error:", error);
            toast.error("Failed to create account", {
              description: `${field}: ${error}`,
              duration: defaultToastSettings.duration,
              dismissible: defaultToastSettings.isDismissible,
            });
          });
        });
      };

      if (message["patient"]) {
        processErrors(message["patient"]);
      } else {
        processErrors(message);
      }
    };

    // Usage in the response handling
    if (response.success) {
      toast.success("Form submitted successfully!", {
        description: "Your data has been submitted.",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });

      // Reset the form and go back to the first page
      form.reset();
      setCurrentPage("personal");
    } else {
      if (typeof response.message === "string") {
        toast.error("Error submitting form", {
          description: response.message,
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
      } else {
        handleErrors(response.message);
      }
    }
  };

  // Function to handle navigation to clinical page with validation
  const handleNextPage = async () => {
    // Fields to validate before proceeding to clinical page
    const personalInfoRequiredFields = [
      "first_name",
      "last_name",
      "sex",
      "civil_status",
      "date_of_birth",
      "addr_barangay",
      "addr_city",
      "addr_province",
      "addr_region",
    ] as const;

    // Trigger validation for required fields
    const isValid = await form.trigger(personalInfoRequiredFields);

    if (isValid) {
      setCurrentPage("clinical");
    } else {
      toast.warning("Incomplete Information", {
        description: "Please complete all required fields before proceeding.",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <p className="text-2xl lg:text-4xl font-bold">Case Report Form</p>
        <Button variant={"outline"} onClick={() => setBulkUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </div>
      <Separator className="mt-2" />
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className={`border-b-2 pb-2 ${currentPage === "personal" ? "border-blue-500" : "border-gray-200"}`}
          >
            <h2
              className={`font-medium cursor-pointer ${currentPage === "personal" ? "text-blue-500" : "text-gray-500"}`}
              onClick={() => setCurrentPage("personal")}
            >
              Personal Information
            </h2>
          </div>
          <div
            className={`border-b-2 pb-2 ${currentPage === "clinical" ? "border-blue-500" : "border-gray-200"}`}
          >
            <h2
              className={`font-medium cursor-pointer ${currentPage === "clinical" ? "text-blue-500" : "text-gray-500"}`}
              onClick={() => handleNextPage()}
            >
              Clinical Status
            </h2>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {currentPage === "personal" ? (
              <Card>
                <CardContent className="pt-6">
                  <PersonalDetailSection form={form} />
                  <div className="mt-8">
                    <AddressSection form={form} />
                  </div>
                  <div className="mt-8">
                    <VaccinationSection form={form} />
                  </div>
                  <div className="flex justify-end mt-8">
                    <Button type="button" onClick={handleNextPage}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <ConsultationSection form={form} />
                  <div className="mt-8">
                    <LaboratoryResultsSection form={form} />
                  </div>
                  <div className="mt-8">
                    <OutcomeSection form={form} />
                  </div>
                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentPage("personal")}
                    >
                      Previous
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>

      <BulkUploadModal open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} />
    </div>
  );
}
