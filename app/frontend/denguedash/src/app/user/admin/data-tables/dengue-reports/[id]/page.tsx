"use client";

import DengueReportView from "@/components/dengue-reports/DengueReportView";
import { CaseView } from "@/interfaces/dengue-reports/dengue-reports.interface";
import fetchService from "@/services/fetch.service";
import { useState, useEffect } from "react";

export default function AdminDengueReportView({ params }: any) {
  const [caseDetails, setCaseDetails] = useState<CaseView>();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      const apiResult: CaseView = await fetchService.getCaseViewDetails(id);
      setCaseDetails(apiResult);
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
