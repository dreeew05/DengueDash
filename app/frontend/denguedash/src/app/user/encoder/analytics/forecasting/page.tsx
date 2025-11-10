"use client";

import ForecastingMain from "@/components/forecasting/ForecastingMain";
import { Separator } from "@/shadcn/components/ui/separator";

export default function EncoderForecastingDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">
            Dengue Forecasting Dashboard
          </p>
          <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
            Forecasting dengue cases based on weather variables
          </p>
        </div>
      </div>
      <Separator className="mt-2" />
      <ForecastingMain />
    </div>
  );
}
