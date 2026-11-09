import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceArea
} from "recharts";
import { format } from "date-fns";
import type { CarbonData, Prediction } from "@shared/schema";
import { useMemo } from "react";

interface ForecastChartProps {
  history: CarbonData[];
  forecast: Prediction[];
  isLoading: boolean;
}

export function ForecastChart({ history, forecast, isLoading }: ForecastChartProps) {
  const data = useMemo(() => {
    // Combine history and forecast into a single timeline
    const historyData = history.map(item => ({
      date: item.date,
      historicalPrice: item.price,
      predictedPrice: null,
      lowerBound: null,
      upperBound: null,
      type: 'historical'
    }));

    const forecastData = forecast.map(item => ({
      date: item.date,
      historicalPrice: null,
      predictedPrice: item.predictedPrice,
      lowerBound: item.lowerBound,
      upperBound: item.upperBound,
      type: 'forecast'
    }));

    // Connect the last historical point to the first forecast point for continuity
    if (history.length > 0 && forecast.length > 0) {
      const lastHistory = history[history.length - 1];
      const bridgePoint = {
        date: lastHistory.date,
        historicalPrice: lastHistory.price,
        predictedPrice: lastHistory.price, // Start prediction from last known actual
        lowerBound: lastHistory.price,
        upperBound: lastHistory.price,
        type: 'bridge'
      };
      return [...historyData, bridgePoint, ...forecastData];
    }

    return [...historyData, ...forecastData];
  }, [history, forecast]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-border bg-card/50">
        <p className="text-muted-foreground">No data available. Try syncing data.</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-2xl border border-border bg-card p-4 pt-8 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), "MMM d")}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `€${value}`}
            domain={['auto', 'auto']}
          />
          
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg backdrop-blur-md">
                    <p className="mb-2 font-display font-semibold">{format(new Date(label), "MMM d, yyyy")}</p>
                    {payload.map((entry: any) => (
                      entry.value !== null && (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground capitalize">
                            {entry.name === 'historicalPrice' ? 'Actual Price' : 
                             entry.name === 'predictedPrice' ? 'Forecast' : entry.name}:
                          </span>
                          <span className="font-mono font-medium">
                            €{Number(entry.value).toFixed(2)}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Confidence Interval Area */}
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill="hsl(var(--accent))"
            fillOpacity={0.1}
          />
           <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="hsl(var(--background))" // Mask out the bottom part
            fillOpacity={1}
          />

          {/* Historical Line */}
          <Area
            type="monotone"
            dataKey="historicalPrice"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHistorical)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

          {/* Forecast Line */}
          <Line
            type="monotone"
            dataKey="predictedPrice"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
