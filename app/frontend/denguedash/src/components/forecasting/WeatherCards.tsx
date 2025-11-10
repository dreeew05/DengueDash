import { WeatherInterface } from "@/interfaces/common/weather.interface";
import { ModelPredictions } from "@/interfaces/forecasting/predictions.interface";
import fetchService from "@/services/fetch.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { Calendar, Droplets, Thermometer, Umbrella } from "lucide-react";
import { useEffect, useState } from "react";

type WeatherCardsProps = {
  predictions: ModelPredictions;
  year: number;
  week: number;
};

// todo: use weather data from openweatherapi
const futureWeather = {
  future_weather: [
    {
      rainfall: 45.5,
      max_temperature: 32.1,
      humidity: 85.0,
    },
    {
      rainfall: 43.2,
      max_temperature: 31.8,
      humidity: 83.5,
    },
    {
      rainfall: 41.8,
      max_temperature: 32.3,
      humidity: 82.0,
    },
    {
      rainfall: 44.5,
      max_temperature: 31.9,
      humidity: 84.5,
    },
    {
      rainfall: 42.7,
      max_temperature: 32.5,
      humidity: 83.0,
    },
  ],
};

export default function WeatherCards(props: WeatherCardsProps) {
  const [currentWeekWeatherData, setCurrentWeekWeatherData] = useState<
    WeatherInterface[]
  >([]);

  useEffect(() => {
    const fetchCurrentWeekWeatherData = async () => {
      const response: WeatherInterface[] = await fetchService.getWeatherData({
        year: props.year,
        week: props.week,
      });
      setCurrentWeekWeatherData(response);
    };
    fetchCurrentWeekWeatherData();
  }, [props.year, props.week]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Weather Variables</CardTitle>
          <CardDescription>
            Factors influencing dengue transmission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
              <Thermometer className="h-8 w-8 text-orange-500 mb-2" />
              <div className="text-2xl font-bold">
                {currentWeekWeatherData.length === 0 ? (
                  <Skeleton className="h-16 w-16 rounded-full mb-2" />
                ) : (
                  currentWeekWeatherData[0].weekly_temperature.toFixed(2)
                )}
                °C
              </div>
              <div className="text-sm text-muted-foreground">
                Max Temperature
              </div>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
              <Droplets className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">
                {currentWeekWeatherData.length === 0 ? (
                  <Skeleton className="h-16 w-16 rounded-full mb-2" />
                ) : (
                  currentWeekWeatherData[0].weekly_humidity.toFixed(2)
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">Humidity</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
              <Umbrella className="h-8 w-8 text-cyan-500 mb-2" />
              <div className="text-2xl font-bold">
                {currentWeekWeatherData.length === 0 ? (
                  <Skeleton className="h-16 w-16 rounded-full mb-2" />
                ) : (
                  currentWeekWeatherData[0].weekly_rainfall.toFixed(2)
                )}
                mm
              </div>
              <div className="text-sm text-muted-foreground">Rainfall</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {props.predictions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Forecasted Weather Variables</CardTitle>
            <CardDescription>
              Weekly averages for the next 2 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week1">
              <TabsList className="mb-4">
                <TabsTrigger value="week1">Next Week</TabsTrigger>
                <TabsTrigger value="week2">Two Weeks Ahead</TabsTrigger>
              </TabsList>
              <TabsContent value="week1">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                    <Thermometer className="h-8 w-8 text-orange-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {futureWeather.future_weather[0].max_temperature}°C
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max Temperature
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                    <Droplets className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {futureWeather.future_weather[0].humidity}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Humidity
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                    <Umbrella className="h-8 w-8 text-cyan-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {futureWeather.future_weather[0].rainfall}mm
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rainfall
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="week2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                    <Thermometer className="h-8 w-8 text-orange-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {futureWeather.future_weather[1].max_temperature}°C
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max Temperature
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                    <Droplets className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {futureWeather.future_weather[1].humidity}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Humidity
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                    <Umbrella className="h-8 w-8 text-cyan-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {futureWeather.future_weather[1].rainfall}mm
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rainfall
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Forecasted Weather Variables
            </CardTitle>
            <CardDescription>
              Generate predictions to see weather forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[180px]">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                Weather forecasts will appear here after generating predictions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
