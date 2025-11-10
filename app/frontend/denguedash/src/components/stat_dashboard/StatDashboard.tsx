"use client";

import ChartHeader from "./ChartHeader";
import fetchService from "@/services/fetch.service";
import { useCallback, useEffect, useMemo, useState } from "react";
import ComboChart from "@components/charts/ComboChart";
import BarChart from "@components/charts/BarChart";
import StatCard from "./StatCard";
import ChoroplethMapWrapper from "../map/ChoroplethMapWrapper";
import { Separator } from "@/shadcn/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/components/ui/dialog";
import { Button } from "@/shadcn/components/ui/button";
import { Label } from "@/shadcn/components/ui/label";
import CustomPopover from "../common/CustomPopover";
import { transformData } from "@/lib/utils/data-transormation.util";
import {
  ByDateInterface,
  ByLocationInterface,
  CurrentCaseCount,
} from "@/interfaces/stat/stat.interfaces";

const locations = [
  {
    value: "Iloilo City",
    label: "Iloilo City",
  },
];
locations.unshift({ value: "All", label: "All" });

const START_YEAR = 2011;

const years = Array.from(
  { length: new Date().getFullYear() - START_YEAR + 1 },
  (_, i) => (START_YEAR + i).toString()
);
// Add "All" option in the first index
years.unshift("All");

export default function StatDashboard() {
  const [caseData, setCaseData] = useState<CurrentCaseCount | null>(null);
  const [caseDeathsData, setCaseDeathData] = useState<ByDateInterface[]>([]);
  const [mapData, setMapData] = useState<ByLocationInterface[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Popovers
  const [locVal, setLocVal] = useState<string>("Iloilo City");
  const [yearVal, setYearVal] = useState<string>(
    new Date().getFullYear().toString()
  );

  const getTopDataMetric = <T extends Record<string, any>>(
    data: T[],
    metricKey: keyof T,
    labelKey: keyof T,
    topCount: number = 5 // Default number of bars
  ) => {
    const sortedData = [...data].sort((a, b) => b[metricKey] - a[metricKey]);

    // Keep only the data with metricKey > 0
    const filteredData = sortedData.filter((item) => item[metricKey] > 0);

    // Slice the top N items
    const topData = filteredData.slice(
      0,
      Math.min(topCount, filteredData.length)
    );

    return transformData(topData, labelKey as string, metricKey as string);
  };

  const topBarangays = useMemo(() => {
    const LABEL_KEY = "location";
    const VALUE_KEY = "case_count";

    return getTopDataMetric(mapData, VALUE_KEY, LABEL_KEY);
  }, [mapData]);

  const topBarangaysDeaths = useMemo(() => {
    const LABEL_KEY = "location";
    const VALUE_KEY = "death_count";

    return getTopDataMetric(mapData, VALUE_KEY, LABEL_KEY);
  }, [mapData]);

  // todo: add try catch
  const fetchQuickStat = async (year: number | undefined) => {
    const response: CurrentCaseCount = await fetchService.getQuickStat(year);
    setCaseData(response);
  };

  const fetchDengueCountDeaths = async (year: number | undefined) => {
    // todo: make the location dynamic
    try {
      // todo: if user is authenticated, use getAuthCasesDeaths
      const response: ByDateInterface[] =
        await fetchService.getDenguePublicByDateStats({
          year: year,
          city: "ILOILO CITY (Capital)",
        });
      setCaseDeathData(response);
    } catch (error) {
      console.error("Failed to fetch dengue count deaths:", error);
    }
  };

  // todo: add try catch
  const fetchBarangayData = async (year: number | undefined) => {
    const response: ByLocationInterface[] =
      // todo: create an interface for the params
      await fetchService.getDenguePublicLocationStats({
        year: year,
        city: "ILOILO CITY (Capital)",
        group_by: "barangay",
      });
    setMapData(response);
    setDataLoaded(true);
  };

  const fetchAllData = useCallback((option: string) => {
    const year = option == "All" ? undefined : parseInt(option);
    fetchQuickStat(year);
    fetchDengueCountDeaths(year);
    fetchBarangayData(year);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchAllData(new Date().getFullYear().toString());
  }, [fetchAllData]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex flex-row justify-between gap-1">
          <div>
            <p className="text-2xl lg:text-4xl font-bold">
              Iloilo City Dengue Dashboard
            </p>
            <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
              As of March 2025
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Configure Data</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Configure Data</DialogTitle>
                <DialogDescription>
                  Make changes to the data here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Location
                  </Label>
                  <CustomPopover
                    label="Location"
                    options={locations}
                    value={locVal}
                    setValue={setLocVal}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Year
                  </Label>
                  <CustomPopover
                    label="Year"
                    options={years.map((year) => ({
                      value: year,
                      label: year,
                    }))}
                    value={yearVal}
                    setValue={setYearVal}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => fetchAllData(yearVal)}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Separator className="mt-2" />
      </div>
      {dataLoaded && (
        <>
          {/* Overview Statitstics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
            <StatCard
              title={"Total Cases"}
              value={caseData?.total_cases.toString() || "0"}
              subvalue={
                caseData?.weekly_cases == null
                  ? null
                  : caseData.weekly_cases.toString()
              }
              icon={"fluent-emoji-high-contrast:mosquito"}
            />
            <StatCard
              title={"Severe Cases"}
              value={caseData?.total_severe_cases.toString() || "0"}
              subvalue={
                caseData?.weekly_severe_cases == null
                  ? null
                  : caseData.weekly_severe_cases.toString()
              }
              icon={"fa:heartbeat"}
            />
            <StatCard
              title={"Lab Confirmed Cases"}
              value={caseData?.total_lab_confirmed_cases.toString() || "0"}
              subvalue={
                caseData?.weekly_lab_confirmed_cases == null
                  ? null
                  : caseData.weekly_lab_confirmed_cases.toString()
              }
              icon={"icomoon-free:lab"}
            />
            <StatCard
              title={"Total Deaths"}
              value={caseData?.total_deaths.toString() || "0"}
              subvalue={
                caseData?.weekly_deaths == null
                  ? null
                  : caseData.weekly_deaths.toString()
              }
              icon={"ion:skull"}
            />
          </div>
          <div className="border border-grey rounded-lg ">
            <ChartHeader title={"Number of Dengue Cases and Deaths"} />
            <ComboChart data={caseDeathsData} />
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Choropleth Map */}
            <div className="border border-grey rounded-lg flex-1">
              <ChartHeader title={"Dengue Situation"} />
              <ChoroplethMapWrapper dengueData={mapData} />
            </div>
            {/* Right Side */}
            <div className="flex flex-col flex-1 gap-3">
              <div className="border border-grey rounded-lg">
                <ChartHeader title={"Top Barangays with most Dengue Cases"} />
                <BarChart
                  cardHeight="328px"
                  data={topBarangays}
                  yLabel="Cases"
                  barColor="#3182CE"
                />
              </div>
              <div className="border border-grey rounded-lg">
                <ChartHeader
                  title={"Top Barangays with most Mortality Cases"}
                />
                <BarChart
                  cardHeight="328px"
                  data={topBarangaysDeaths}
                  yLabel="Death Cases"
                  barColor="#ee2d60"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
