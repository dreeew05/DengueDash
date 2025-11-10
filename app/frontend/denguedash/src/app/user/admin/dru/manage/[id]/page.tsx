"use client";

import { Separator } from "@/shadcn/components/ui/separator";
import { Card } from "@shadcn/components/ui/card";
import { Button } from "@shadcn/components/ui/button";
import { Trash2 } from "lucide-react";
import { CustomAlertDialog } from "@/components/common/CustomAlertDialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DRUProfileInterface } from "@/interfaces/dru/dru.interface";
import fetchService from "@/services/fetch.service";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format-datetime.util";
import { BaseServiceResponse } from "@/interfaces/services/services.interface";
import deleteService from "@/services/delete.service";

export default function DRUProfileView({ params }: any) {
  const router = useRouter();
  const [druData, setDRUData] = useState<DRUProfileInterface>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { id } = await params;
        const response = await fetchService.getDRUProfile(id);
        setDRUData(response);
        console.log(response.created_at);
      } catch (error) {
        toast.error("Failed to fetch DRU details", {
          description: "Something went wrong",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        console.error("Failed to fetch DRU details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (druData?.id !== undefined) {
      const response: BaseServiceResponse = await deleteService.deleteDRU(
        druData.id
      );
      if (response.success) {
        router.push("/user/admin/dru/manage/?status=dru-deleted");
      } else {
        toast.error("Failed to delete DRU", {
          description: response.message,
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
      }
    } else {
      toast.error("Failed to delete DRU", {
        description: "Something went wrong",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">
            Disease Reporting Unit Profile
          </p>
          <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
            View and manage DRU details
          </p>
        </div>
      </div>
      <Separator className="mt-2" />
      <div className="container py-5">
        <Card className="p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Name of DRU
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">
                  {druData?.dru_name}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Email
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">{druData?.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Address
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">
                  {druData?.full_address}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Contact Number
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">
                  {druData?.contact_number}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Region
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">{druData?.region}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Surveillance Unit
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">
                  {druData?.surveillance_unit}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              DRU Type
            </h3>
            {isLoading ? (
              <Skeleton className="h-5" />
            ) : (
              <p className="text-base font-medium mt-1">{druData?.dru_type}</p>
            )}
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Created At
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">
                  {druData?.created_at
                    ? formatDateTime(druData.created_at)
                    : "N/A"}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Updated At
              </h3>
              {isLoading ? (
                <Skeleton className="h-5" />
              ) : (
                <p className="text-base font-medium mt-1">
                  {druData?.created_at
                    ? formatDateTime(druData.updated_at)
                    : "N/A"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-10">
            <CustomAlertDialog
              title="Delete DRU"
              description="Are you sure you want to delete this DRU? This action cannot be undone."
              actionLabel="Delete"
              onAction={handleDelete}
              variant="destructive"
            >
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete DRU
              </Button>
            </CustomAlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
}
