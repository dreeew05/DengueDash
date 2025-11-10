"use client";

import {
  BlacklistedAccount,
  BlacklistedAccountListPagination,
} from "@/interfaces/account/user-interface";
import fetchService from "@/services/fetch.service";
import { useEffect, useState, useCallback } from "react";
import CustomPagination from "../common/CustomPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/components/ui/table";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { CustomAlertDialog } from "../common/CustomAlertDialog";
import { Button } from "@/shadcn/components/ui/button";
import { BaseServiceResponse } from "@/interfaces/services/services.interface";
import deleteService from "@/services/delete.service";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";

export default function BlacklistedAccounts() {
  const [blacklistedAccounts, setBlacklistedAccounts] = useState<
    BlacklistedAccount[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;

  const fetchBlacklistedAccounts = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response: BlacklistedAccountListPagination =
          await fetchService.getBlacklistedAccounts(page, itemsPerPage);
        const data: BlacklistedAccount[] = response.results;
        setBlacklistedAccounts(data);

        const totalCount = parseInt(response.count.toString() || "0", 10);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      } catch (error) {
        console.error("Failed to fetch blacklisted accounts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    fetchBlacklistedAccounts(currentPage);
  }, [currentPage, fetchBlacklistedAccounts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const unbanUser = async (userId: number) => {
    try {
      const response: BaseServiceResponse =
        await deleteService.unbanUser(userId);
      if (response.success) {
        toast.success("User unbanned successfully", {
          description: "The selected user has been successfully unbanned",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        fetchBlacklistedAccounts(currentPage);
      } else {
        toast.error("User unban failed", {
          description: response.message,
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
      }
    } catch (error) {
      console.error("Failed to unban user:", error);
      toast.error("Failed to unban user", {
        description: "An error occurred while trying to unban the user.",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };

  return (
    <div className="container mx-auto p-4 border border-gray-200 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                <Skeleton className="h-5" />
              </TableCell>
            </TableRow>
          ) : blacklistedAccounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No Pending Unverified Accounts
              </TableCell>
            </TableRow>
          ) : (
            blacklistedAccounts.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.date_added.split("T")[0]}</TableCell>
                <TableCell className="flex gap-3">
                  <CustomAlertDialog
                    title="Approve User"
                    description="Are you sure you want to unban this user? This action cannot be undone."
                    actionLabel="Approve"
                    onAction={() => unbanUser(user.id)}
                  >
                    <Button variant={"default"}>Unban</Button>
                  </CustomAlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
}
