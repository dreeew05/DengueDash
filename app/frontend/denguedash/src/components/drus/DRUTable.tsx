"use client";

import {
  BriefDRUDetails,
  DRUListPagination,
} from "@/interfaces/dru/dru.interface";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import fetchService from "@/services/fetch.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CustomPagination from "../common/CustomPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shadcn/components/ui/table";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { Button } from "@/shadcn/components/ui/button";
import Link from "next/link";

export default function DRUTable() {
  const [drus, setDrus] = useState<BriefDRUDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchDRUs(currentPage);
  }, [currentPage]);

  const fetchDRUs = async (page: number) => {
    setIsLoading(true);
    try {
      const response: DRUListPagination = await fetchService.getDRUList(
        page,
        itemsPerPage
      );
      const data: BriefDRUDetails[] = response.results;
      setDrus(data);
    } catch (error) {
      toast.error("Failed to fetch DRUs", {
        description: "Something went wrong",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
      console.error("Failed to fetch DRUs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 border border-gray-200 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DRU Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                <Skeleton className="h-5" />
              </TableCell>
            </TableRow>
          ) : (
            drus.map((dru) => (
              <TableRow key={dru.id}>
                <TableCell>{dru.dru_name}</TableCell>
                <TableCell>{dru.email}</TableCell>
                <TableCell>
                  <Button variant={"outline"} asChild>
                    <Link href={`manage/${dru.id}`}>Open</Link>
                  </Button>
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
