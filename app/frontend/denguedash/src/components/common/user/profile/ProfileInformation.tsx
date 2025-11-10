import { UserDetailInterface } from "@/interfaces/account/user-interface";
import { formatDateTime } from "@/lib/utils/format-datetime.util";
import { CardContent } from "@/shadcn/components/ui/card";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@shadcn/components/ui/avatar";
import { Badge } from "@shadcn/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function ProfileInformation(
  isLoading: boolean,
  userData: UserDetailInterface | undefined
) {
  return (
    <CardContent className="p-8">
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Profile Picture - 2/3 width */}
        <div className="flex flex-col items-center lg:items-start lg:w-2/3">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-gray-100">
              {isLoading ? (
                <Skeleton className="h-32 w-32 rounded-full" />
              ) : (
                <AvatarImage
                  src={userData?.profile_image_url || "/placeholder.svg"}
                  alt="Profile Picture"
                />
              )}
              <AvatarFallback className="text-2xl font-semibold bg-gray-100 text-gray-600">
                {userData?.full_name
                  ? userData.full_name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "??"}
              </AvatarFallback>
            </Avatar>
          </div>
          {isLoading ? (
            <Skeleton className="h-5" />
          ) : (
            <h2 className="text-2xl font-bold mt-4 text-center lg:text-left">
              {userData?.full_name}
            </h2>
          )}

          {isLoading ? (
            <Skeleton className="h-5" />
          ) : (
            <Badge variant="secondary" className="mt-2">
              {userData?.role}
            </Badge>
          )}
        </div>

        <div className="lg:w-1/2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              ID Card
            </label>
            <div className="relative group">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <img
                    src={userData?.id_card_image_url || "/placeholder.svg"}
                    alt="ID Card"
                    width={400}
                    height={200}
                    className="object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Sex
            </label>
            {isLoading ? (
              <Skeleton className="h-5" />
            ) : (
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {userData?.sex_display}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Email
            </label>
            {isLoading ? (
              <Skeleton className="h-5" />
            ) : (
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {userData?.email}
              </p>
            )}{" "}
          </div>
        </div>
      </div>

      {/* Hospital Information */}
      <div className="mb-8">
        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Hospital (DRU)
        </label>

        {isLoading ? (
          <Skeleton className="h-5" />
        ) : (
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {userData?.dru}
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Created At
          </label>
          {isLoading ? (
            <Skeleton className="h-5" />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {userData?.created_at
                ? formatDateTime(userData.created_at)
                : "N/A"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Updated At
          </label>
          {isLoading ? (
            <Skeleton className="h-5" />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {userData?.updated_at
                ? formatDateTime(userData.updated_at)
                : "N/A"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Last Login
          </label>
          {isLoading ? (
            <Skeleton className="h-5" />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {userData?.last_login
                ? formatDateTime(userData.last_login)
                : "N/A"}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  );
}
