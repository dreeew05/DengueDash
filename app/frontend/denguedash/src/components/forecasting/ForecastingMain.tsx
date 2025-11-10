import postService from "@/services/post.service";
import { useEffect, useMemo, useState } from "react";

import {
  ModelPredictionResponse,
  ModelPredictions,
  PredictionMetadata,
} from "@/interfaces/forecasting/predictions.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn/components/ui/card";
import { Button } from "@shadcn/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@shadcn/components/ui/alert";
import { Info, Shield, BarChartHorizontal } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format-datetime.util";
import fetchService from "@/services/fetch.service";
import { ByLocationInterface } from "@/interfaces/stat/stat.interfaces";
import TrendAndPredictionLineChart from "@/components/forecasting/CasesLIneChart";
import CasesCards from "@/components/forecasting/CasesCards";
import WeatherCards from "@/components/forecasting/WeatherCards";
import CasesRiskLocations from "@/components/forecasting/CasesRiskLocations";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";

export default function ForecastingMain() {
  const [currentWeekDengueData, setCurrentWeekDengueData] = useState<
    ByLocationInterface[]
  >([]);

  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionMetaData, setPredictionMetaData] =
    useState<PredictionMetadata | null>(null);
  const [predictions, setPredictions] = useState<ModelPredictions>([]);

  // todo: use this in the future to fetch real data
  // const getWeekNumber = (date: Date): number => {
  //   const startOfYear = new Date(date.getFullYear(), 0, 1);
  //   const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  //   return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  // };

  // Todo: use this in the future to fetch real data
  // const currentYear = new Date().getFullYear();
  // const currentWeek = getWeekNumber(new Date());
  const currentYear = 2025;
  const currentWeek = 13;

  const thisWeekCases: number = useMemo(() => {
    return (
      currentWeekDengueData?.reduce(
        (total: number, curr: ByLocationInterface) => total + curr.case_count,
        0
      ) ?? 0
    );
  }, [currentWeekDengueData]);

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const response: ModelPredictionResponse =
        await postService.predictCases();
      if (response.success == false) {
        setIsPredicting(false);
        toast.error("Error generating predictions", {
          description: response.message,
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        return;
      }
      setPredictions(response.predictions);
      setPredictionMetaData(response.metadata);
      setIsPredicting(false);
    } catch {
      setIsPredicting(false);
      toast.error("Failed to connect to the server", {
        description: "Please check your internet connection",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };

  const fetchCurrentWeekDengueData = async () => {
    const response: ByLocationInterface[] =
      await fetchService.getDengueAuthLocationStats(
        // todo: when deployed use the current data
        // todo: for now let's get the last fetched data
        //   {
        //   year: new Date().getFullYear(),
        //   week: getWeekNumber(new Date()),
        //   city: encodeURIComponent("ILOILO CITY (Capital)"),
        //   group_by: "barangay",
        // }
        {
          year: currentYear,
          week: currentWeek,
        }
      );
    setCurrentWeekDengueData(response);
  };

  useEffect(() => {
    fetchCurrentWeekDengueData();
  }, []);

  return (
    <>
      <div className="container mx-auto py-2">
        {predictions.length > 0 ? (
          <div className="text-md text-muted-foreground mb-4 text-right">
            Last updated :{" "}
            {formatDateTime(predictionMetaData?.prediction_generated_at ?? "")}
          </div>
        ) : null}

        {/* Prediction Button */}
        {predictions.length == 0 && !isPredicting && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-6">
                <BarChartHorizontal className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Generate Dengue Predictions
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Click the button below to predict dengue cases for the next 2
                  weeks based on current weather data and historical patterns.
                </p>
                <Button size="lg" onClick={handlePredict}>
                  Generate Predictions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isPredicting && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-6">
                <div className="animate-pulse flex flex-col items-center">
                  <BarChartHorizontal className="h-16 w-16 text-primary/70 mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    Generating Predictions...
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Analyzing weather patterns and historical data to predict
                    dengue cases.
                  </p>
                  <div className="w-64 h-2 bg-primary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prediction Cards */}
        <CasesCards predictions={predictions} thisWeekCases={thisWeekCases} />

        {/* Trend chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dengue Cases Trend & Prediction</CardTitle>
            <CardDescription>
              Last 5 weeks historical data{" "}
              {predictions.length > 0 ? "and 2-week forecast" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAndPredictionLineChart forecastedData={predictions} />
          </CardContent>
        </Card>

        {/* Weather variables */}
        <WeatherCards
          predictions={predictions}
          year={currentYear}
          week={currentWeek}
        />

        {/* Additional helpful components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CasesRiskLocations currentWeekDengueData={currentWeekDengueData} />
          <Card>
            <CardHeader>
              <CardTitle>Prevention Measures</CardTitle>
              <CardDescription>
                Recommended actions based on risk level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Eliminate breeding sites</p>
                    <p className="text-sm text-muted-foreground">
                      Remove standing water from containers around homes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Use mosquito repellent</p>
                    <p className="text-sm text-muted-foreground">
                      Apply EPA-registered insect repellent
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Wear protective clothing</p>
                    <p className="text-sm text-muted-foreground">
                      Long sleeves and pants, especially during peak mosquito
                      activity
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert and model information */}
        <div className="grid grid-cols-1 gap-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>About this prediction model</AlertTitle>
            <AlertDescription>
              This dashboard uses a machine learning model trained on historical
              dengue cases and weather data. Predictions are based on the
              correlation between weather variables (temperature, humidity,
              rainfall) and dengue incidence. The model is updated weekly with
              new data to improve accuracy.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </>
  );
}
