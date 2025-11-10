import { ModelPredictions } from "@/interfaces/forecasting/predictions.interface";
import { ByDateInterface } from "@/interfaces/stat/stat.interfaces";
import fetchService from "@/services/fetch.service";
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

type TrendAndPredictionLineChartProps = {
  forecastedData: ModelPredictions;
};

export default function TrendAndPredictionLineChart(
  props: TrendAndPredictionLineChartProps
) {
  const [historicalData, setHistoricalData] = useState<ByDateInterface[]>([]);

  const fetchHistoricalData = async () => {
    const response: ByDateInterface[] =
      await fetchService.getDengueAuthByDateStats({
        recent_weeks: 4,
      });
    setHistoricalData(response);
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  // Transform data from API to match the chart format
  const chartData = useMemo(() => {
    // Initial data
    const historicalChartData = historicalData.map((item) => ({
      label: item.label,
      historical: item.case_count,
      outbreak_threshold: item.outbreak_threshold,
      forecast: null,
    }));

    // Get the last outbreak_threshold value from historical data
    const lastOutbreakThreshold =
      historicalChartData.length > 0
        ? historicalChartData[historicalChartData.length - 1].outbreak_threshold
        : null;

    // Forecasted data [When "Generated Predictions" is clicked]
    const forecastedChartData =
      props.forecastedData?.map((item) => ({
        label: "Week " + item.week,
        historical: null,
        forecast: item.predicted_cases,
        outbreak_threshold: lastOutbreakThreshold, // extend threshold
      })) || [];

    if (historicalChartData.length > 0 && forecastedChartData.length > 0) {
      return [...historicalChartData, ...forecastedChartData];
    }
    return historicalChartData;
  }, [historicalData, props.forecastedData]);

  // Find the index where forecast data starts
  const forecastStartInfo = useMemo(() => {
    const index = chartData.findIndex(
      (item) => item.forecast !== null && item.historical === null
    );
    if (index >= 0) {
      // Get the actual label of the forecast start point
      return {
        index,
        label: chartData[index].label,
      };
    }
    return null;
  }, [chartData]);

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: any[];
    label?: string;
  }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isForecast =
        dataPoint.forecast !== null && dataPoint.historical === null;

      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{label}</p>
          <p
            className="text-sm"
            style={{ color: isForecast ? "#FF6B6B" : "#10B981" }}
          >
            {isForecast
              ? `Forecast: ${dataPoint.forecast}`
              : `Historical: ${dataPoint.historical}`}
          </p>
          <p className="text-sm" style={{ color: "#d893e1" }}>
            Outbreak Threshold: {dataPoint.outbreak_threshold || "N/A"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Find max value to set domain
  const maxValue = useMemo(() => {
    const allValues = chartData.flatMap((item) => [
      item.historical || 0,
      item.forecast || 0,
    ]);

    return Math.max(...allValues, 50);
  }, [chartData]);

  const maxOutbreakThreshold = useMemo(() => {
    return Math.max(
      ...chartData
        .filter(
          (item) => item.historical !== null && "outbreak_threshold" in item
        )
        .map(
          (item) =>
            (item as { outbreak_threshold: number }).outbreak_threshold || 0
        ),
      50
    );
  }, [chartData]);

  // Custom dot renderer to correctly show historical vs forecast points
  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isForecast = payload.forecast !== null && payload.historical === null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isForecast ? "#FF6B6B" : "#10B981"}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="h-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" padding={{ left: 10, right: 10 }} />

          {/* Single Y-axis for both lines */}
          <YAxis
            domain={[
              0,
              Math.max(
                Math.ceil(maxValue * 1.2),
                Math.ceil(maxOutbreakThreshold * 1.2)
              ),
            ]}
            tickCount={5}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />

          <Line
            type="linear"
            dataKey="outbreak_threshold"
            stroke="#d893e1"
            name="Outbreak Threshold"
            strokeWidth={3}
            dot={false}
          />

          {/* Main line with custom dots */}
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey={(chartData) =>
              chartData.historical !== null
                ? chartData.historical
                : chartData.forecast
            }
            stroke="#10B981"
            strokeWidth={2}
            dot={<CustomizedDot />}
            activeDot={{ r: 6 }}
            connectNulls
            name="Historical/Forecast Data"
          />

          {/* Use ReferenceLine component for exact alignment */}
          {forecastStartInfo && (
            <ReferenceLine
              x={forecastStartInfo.label}
              stroke="black"
              strokeDasharray="5 5"
              label={{
                value: "Forecast Start",
                position: "top",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  fill: "black",
                },
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
