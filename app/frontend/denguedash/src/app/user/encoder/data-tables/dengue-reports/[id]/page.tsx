"use client";

import DengueReportView from "@/components/dengue-reports/DengueReportView";
import { CaseView } from "@/interfaces/dengue-reports/dengue-reports.interface";
import fetchService from "@/services/fetch.service";
import { useState, useEffect } from "react";

export default function UserDengueReportView({ params }: any) {
  const [caseDetails, setCaseDetails] = useState<CaseView>();

  useEffect(() => {
    const fetchData = async () => {
      // todo: add try catch block
      const { id } = await params;
      const response: CaseView = await fetchService.getCaseViewDetails(id);
      setCaseDetails(response);
    };
    fetchData();
  }, [params]);

  return caseDetails ? (
    <DengueReportView caseDetails={caseDetails} />
  ) : (
    // todo: add skeleton loader
    <div>Loading...</div>
  );
}
