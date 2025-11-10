"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@shadcn/components/ui/sidebar";
import AppSidebar from "@/components/common/user/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/shadcn/components/ui/breadcrumb";
import { Separator } from "@/shadcn/components/ui/separator";

import { useEffect, useState } from "react";

type LayoutComponentsProps = {
  isAdmin: boolean;
  druType: string;
  children: React.ReactNode;
};

export default function LayoutComponents({
  isAdmin,
  druType,
  children,
}: LayoutComponentsProps) {
  // Make the segments update in the sidebar
  const [segment, setSegment] = useState<string | null>(null);
  const [page, setPage] = useState<string | null>(null);
  useEffect(() => {
    // Index 3 is the segment
    // Examples: account, analytics, data-tables
    const pathname = window.location.pathname;
    setSegment(pathname.split("/")[3]);
    setPage(pathname.split("/")[4]);
  }, []);

  const toTitleCase = (str: string | null) => {
    if (str === null) return "";
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (segment == null) {
    return null;
  }

  return (
    <div className="flex justify-center gap-4 px-5 pt-2 pb-5">
      <div className="w-5/6">
        <SidebarProvider>
          <AppSidebar
            sectionSegment={segment}
            isAdmin={isAdmin}
            druType={druType}
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink>{toTitleCase(segment)}</BreadcrumbLink>
                    </BreadcrumbItem>

                    {page && (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          <BreadcrumbLink>{toTitleCase(page)}</BreadcrumbLink>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main>{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
