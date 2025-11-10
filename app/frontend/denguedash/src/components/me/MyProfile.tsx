"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { Separator } from "@/shadcn/components/ui/separator";
import ProfileInformation from "../common/user/profile/ProfileInformation";
import { useEffect, useState } from "react";
import { UserDetailInterface } from "@/interfaces/account/user-interface";
import fetchService from "@/services/fetch.service";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { UpdatePassword } from "./UpdatePassword";

export default function MyProfile() {
  const [userData, setUserData] = useState<UserDetailInterface>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response: UserDetailInterface = await fetchService.getMyProfile();
        setUserData(response);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.warning("Failed to fetch user details", {
          description: "Please check your internet connection.",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">My Profile</p>
          <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
            View profile information and change password
          </p>
        </div>
      </div>
      <Separator className="mt-2" />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="px-6">
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="px-6">
            Password
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            {ProfileInformation(isLoading, userData)}
          </Card>
        </TabsContent>
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePassword />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
