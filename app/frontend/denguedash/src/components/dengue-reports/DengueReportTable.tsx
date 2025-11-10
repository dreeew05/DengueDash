"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shadcn/components/ui/table";

import { Button } from "@/shadcn/components/ui/button";
import {
  Case,
  DengueReportPagination,
} from "@interfaces/dengue-reports/dengue-reports.interface";
import Link from "next/link";
import fetchService from "@/services/fetch.service";
import { Separator } from "@/shadcn/components/ui/separator";
import CustomPagination from "../common/CustomPagination";
import { Search } from "lucide-react";
import { Input } from "@/shadcn/components/ui/input";
import { Skeleton } from "@/shadcn/components/ui/skeleton";

export default function DengueReportTable() {
  const [cases, setCases] = useState<Case[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;

  const fetchCases = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response: DengueReportPagination =
          await fetchService.getDengueReports(page, itemsPerPage, searchQuery);

        const data: Case[] = response.results;
        setCases(data);
        const totalCount = parseInt(response.count.toString() || "0", 10);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      } catch (error) {
        console.error("Failed to fetch dengue cases:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage, searchQuery]
  );

  // Tracking pagination
  useEffect(() => {
    fetchCases(currentPage);
  }, [currentPage, fetchCases]);

  // Tracking search
  useEffect(() => {
    // Reset to the first page when search query changes
    setCurrentPage(1);
  }, [searchQuery, fetchCases]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">Dengue Reports</p>
        </div>
      </div>
      <Separator className="mt-2" />

      {/* Search Bar */}
      <div className="relative mt-2 mb-3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          type="text"
          placeholder="Search by name, location, date of consultation, or classification"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="container mx-auto p-4 border border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Date Consulted</TableHead>
              <TableHead>Clincal Classification</TableHead>
              <TableHead>Case Classification</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={8} className="text-center">
                    <Skeleton className="h-5" />
                  </TableCell>
                </TableRow>
              ))
            ) : cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No Cases Found
                </TableCell>
              </TableRow>
            ) : (
              cases.map((dengueCase) => (
                <TableRow key={dengueCase.case_id}>
                  <TableCell>{dengueCase.case_id}</TableCell>
                  <TableCell>{dengueCase.patient.full_name}</TableCell>
                  <TableCell>{dengueCase.patient.addr_barangay}</TableCell>
                  <TableCell>{dengueCase.patient.addr_city}</TableCell>
                  <TableCell>{dengueCase.date_con}</TableCell>
                  <TableCell>{dengueCase.clncl_class_display}</TableCell>
                  <TableCell>{dengueCase.case_class_display}</TableCell>
                  <TableCell>
                    <Button variant={"outline"} asChild>
                      <Link href={`dengue-reports/${dengueCase.case_id}`}>
                        Open
                      </Link>
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
    </div>
  );
}
