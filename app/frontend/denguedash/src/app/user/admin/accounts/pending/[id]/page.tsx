"use client";

import { CustomAlertDialog } from "@/components/common/CustomAlertDialog";
import ProfileInformation from "@/components/common/user/profile/ProfileInformation";
import { UserDetailInterface } from "@/interfaces/account/user-interface";
import { BaseServiceResponse } from "@/interfaces/services/services.interface";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import deleteService from "@/services/delete.service";
import fetchService from "@/services/fetch.service";
import patchService from "@/services/patch.service";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardFooter } from "@/shadcn/components/ui/card";
import { Separator } from "@/shadcn/components/ui/separator";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserApproval({ params }: any) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDetailInterface>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { id } = await params;
        const response: BaseServiceResponse =
          await fetchService.getUnverifiedUserDetails(id);

        if (!response.success) {
          router.push("/user/admin/accounts/manage/?status=not-found");
          return;
        }

        setUserData(response.message as unknown as UserDetailInterface);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        router.push("/user/admin/accounts/manage/?status=error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const approveUser = async (userId: number) => {
    const response: BaseServiceResponse =
      await patchService.approveUserVerification(userId);
    if (response.success) {
      router.push("/user/admin/accounts/manage/?status=approved");
    } else {
      toast.error("Failed to approve user", {
        description: response.message,
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };

  const deleteUnverifiedUser = async (userId: number) => {
    if (userId == 0) {
      toast.error("Invalid User ID", {
        description: "There is an error with the user ID. Please try again.",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
      return;
    }

    const response: BaseServiceResponse =
      await deleteService.deleteUser(userId);
    if (response.success) {
      router.push("/user/admin/accounts/manage/?status=deleted");
      // todo: email the user that their account has been disapproved
    } else {
      toast.error("Failed to delete user", {
        description: response.message,
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">User Approval</p>
          <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
            View and manage pending accounts
          </p>
        </div>
      </div>
      <Separator className="mt-2" />
      <div className="container py-5">
        <Card className="shadow-md">
          {ProfileInformation(isLoading, userData)}
          <CardFooter className="flex justify-between gap-2 pt-4">
            <CustomAlertDialog
              title="Approve User"
              description="Are you sure you want to approve this user? This action cannot be undone."
              actionLabel="Approve"
              onAction={() => approveUser(userData?.id || 0)}
            >
              <Button variant={"default"} className="flex-1">
                Approve
              </Button>
            </CustomAlertDialog>
            <CustomAlertDialog
              title="Approve User"
              description="Are you sure you want to delete this user? This action cannot be undone."
              actionLabel="Delete"
              variant="destructive"
              onAction={() => deleteUnverifiedUser(userData?.id || 0)}
            >
              <Button variant={"destructive"} className="flex-1">
                Delete
              </Button>
            </CustomAlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
