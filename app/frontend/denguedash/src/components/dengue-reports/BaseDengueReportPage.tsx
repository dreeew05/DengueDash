"use client";

import DengueReportTable from "@/components/dengue-reports/DengueReportTable";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function BaseDengueReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "case-deleted" && !toastShownRef.current) {
      toastShownRef.current = true;

      toast.success("Case Deleted", {
        description: "The selected case has been successfully deleted",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });

      // Remove the query parameter from the URL to prevent showing the toast again on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("status");

      // Replace the current URL without the status parameter
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  return <DengueReportTable />;
}
