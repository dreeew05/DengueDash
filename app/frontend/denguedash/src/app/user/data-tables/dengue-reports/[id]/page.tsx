"use client";

import {
  CaseView,
  PatientView,
} from "@/interfaces/dengue-reports/dengue-reports.interface";
import fetchService from "@/services/fetch.service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shadcn/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@shadcn/components/ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import deleteService from "@/services/delete.service";
// import { useRouter } from "next/router";
import { redirect } from "next/navigation";

export default function ReportView({ params }: any) {
  // const router = useRouter();
  // const router = useRouter();
  // const push = router ? router.push : () => {};
  const [caseDetails, setCaseDetails] = useState<CaseView>();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      const apiResult: CaseView = await fetchService.getCaseViewDetails(id);
      console.log(id);
      setCaseDetails(apiResult);
    };
    fetchData();
  }, [params]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    if (caseDetails?.case_id !== undefined) {
      const isDeleted = await deleteService.deleteCase(caseDetails.case_id);
      if (isDeleted) {
        redirect("/user/data-tables/dengue-reports");
      }
    }
    setIsDeleting(false);
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | null;
  }) => (
    <div className="border-b pb-2">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="font-medium">{value || "None"}</div>
    </div>
  );

  const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <CardHeader>
      <CardTitle>
        <div className="flex flex-row gap-2">
          <Icon icon={icon} />
          <p>{title}</p>
        </div>
      </CardTitle>
    </CardHeader>
  );

  const PersonalInfoCard = ({
    patientDetails,
  }: {
    patientDetails: PatientView;
  }) => (
    <Card className="w-full">
      {/* Background */}
      <div className="h-20 bg-linear-to-r from-blue-200 via-blue-400 to-orange-300 rounded-t-lg"></div>

      {/* Personal Information Section */}
      <SectionHeader
        icon="fluent:person-28-filled"
        title="Personal Information"
      />
      <CardContent className="flex-col">
        {patientDetails && (
          <div className="mx-auto grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <InfoRow label="Full Name" value={patientDetails.full_name} />
              <InfoRow label="Sex" value={patientDetails.sex_display} />
              <InfoRow
                label="Full Address"
                value={patientDetails.full_address}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InfoRow
                label="Date of Birth"
                value={formatDate(patientDetails.date_of_birth)}
              />
              <InfoRow
                label="Civil Status"
                value={patientDetails.civil_status_display}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Vaccination Status Section */}
      <SectionHeader icon="tabler:vaccine" title="Vaccination Status" />
      <CardContent>
        {patientDetails && (
          <div className="mx-auto grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <InfoRow
                label="First Dose"
                value={
                  patientDetails.date_first_vax
                    ? formatDate(patientDetails.date_first_vax)
                    : null
                }
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InfoRow
                label="Last Dose"
                value={
                  patientDetails.date_last_vax
                    ? formatDate(patientDetails.date_last_vax)
                    : null
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CaseInfoCard = ({ caseDetails }: { caseDetails: CaseView }) => (
    <Card className="w-full">
      {/* Personal Information Section */}
      <div className="flex flex-row justify-between">
        <SectionHeader
          icon="solar:file-bold-duotone"
          title={`Case Record #${caseDetails.case_id}`}
        />
        {caseDetails.can_delete && (
          <div className="py-5 px-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600">
                  Delete Case
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the case record and remove all related data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <CardContent className="flex-col">
        {caseDetails && (
          <div className="mx-auto grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <InfoRow
                label="Date of Consultation"
                value={formatDate(caseDetails.date_con)}
              />
              <InfoRow
                label="Date Onset of Illness"
                value={formatDate(caseDetails.date_onset)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InfoRow
                label="Patient Admitted?"
                value={caseDetails.is_admt ? "Yes" : "No"}
              />
              <InfoRow
                label="Clinical Classification"
                value={caseDetails.clncl_class_display}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Vaccination Status Section */}
      <SectionHeader icon="icomoon-free:lab" title="Laboratory Results" />
      <CardContent>
        <div className="mx-auto grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <InfoRow label="NS1" value={caseDetails.ns1_result_display} />
            <InfoRow label="IgG Elisa" value={caseDetails.igg_elisa_display} />
            <InfoRow label="IgM Elisa" value={caseDetails.igm_elisa_display} />
            <InfoRow label="PCR" value={caseDetails.pcr_display} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <InfoRow
              label="Date Done"
              value={
                caseDetails.date_ns1 ? formatDate(caseDetails.date_ns1) : "N/A"
              }
            />
            <InfoRow
              label="Date Done"
              value={
                caseDetails.date_igg_elisa
                  ? formatDate(caseDetails.date_igg_elisa)
                  : "N/A"
              }
            />
            <InfoRow
              label="Date Done"
              value={
                caseDetails.date_igm_elisa
                  ? formatDate(caseDetails.date_igm_elisa)
                  : "N/A"
              }
            />
            <InfoRow
              label="Date Done"
              value={
                caseDetails.date_pcr ? formatDate(caseDetails.date_pcr) : "N/A"
              }
            />
          </div>
        </div>
      </CardContent>

      {/* Outcome Status Section */}
      <SectionHeader icon="carbon:result" title="Outcome" />
      <CardContent>
        <div className="mx-auto grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <InfoRow
              label="Case Classification"
              value={caseDetails.case_class_display}
            />
            {caseDetails.date_death && (
              <InfoRow
                label="Date of Death"
                value={formatDate(caseDetails.date_death)}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <InfoRow label="Outcome" value={caseDetails.outcome_display} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-5">
      {caseDetails ? (
        <>
          <PersonalInfoCard patientDetails={caseDetails.patient} />
          <CaseInfoCard caseDetails={caseDetails} />
        </>
      ) : null}
    </div>
  );
}
