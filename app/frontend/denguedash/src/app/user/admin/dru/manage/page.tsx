"use client";

import DRUTable from "@/components/drus/DRUTable";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import { Separator } from "@/shadcn/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ManageDRUs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "dru-deleted" && !toastShownRef.current) {
      // Prevent showing the toast again
      toastShownRef.current = true;

      toast.success("DRU Deleted", {
        description: "The selected DRU has been successfully deleted",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });

      // Remove the query parameter from the URL to prevent showing the toast again on refresh
      // This creates a new URL without the status parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("status");

      // Replace the current URL without the status parameter
      // Using replace() instead of push() to avoid adding to the browser history
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">
            Manage Disease Reporting Units
          </p>
          <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
            View and manage Disease Reporting Units
          </p>
        </div>
      </div>
      <Separator className="mt-2" />
      <DRUTable />
    </div>
  );
}
