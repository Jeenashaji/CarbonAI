import { useState } from "react";
import { useCarbonHistory, useForecast, useSyncCarbonData, useTrainModel } from "@/hooks/use-carbon-data";
import { MetricCard } from "@/components/MetricCard";
import { ForecastChart } from "@/components/ForecastChart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  BrainCircuit, 
  Euro, 
  TrendingUp, 
  Target, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { toast } = useToast();
  const [modelType, setModelType] = useState<'SARIMAX' | 'XGBoost'>('SARIMAX');

  // Data Hooks
  const { data: history, isLoading: historyLoading, error: historyError } = useCarbonHistory();
  const { data: forecast, isLoading: forecastLoading } = useForecast(30);
  
  // Mutation Hooks
  const syncMutation = useSyncCarbonData();
  const trainMutation = useTrainModel();

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.count} records.`,
        });
      },
      onError: (err) => {
        toast({
          title: "Sync Failed",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleTrain = () => {
    trainMutation.mutate(modelType, {
      onSuccess: (data) => {
        toast({
          title: "Model Retrained",
          description: data.message,
        });
      },
      onError: (err) => {
        toast({
          title: "Training Failed",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  // Compute metrics
  const latestPrice = history && history.length > 0 ? history[history.length - 1].price : 0;
  const previousPrice = history && history.length > 1 ? history[history.length - 2].price : 0;
  const priceChange = latestPrice - previousPrice;
  const priceTrend = priceChange > 0 ? "up" : priceChange < 0 ? "down" : "neutral";
  
  const forecastTrend = forecast && forecast.length > 0 
    ? (forecast[forecast.length - 1].predictedPrice > latestPrice ? "up" : "down") 
    : "neutral";

  // Mock accuracy for demo purposes if not available
  const accuracy = "94.2%"; 

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
            Market Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time EU ETS carbon price analysis and AI forecasting.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync Data"}
          </Button>
          
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            onClick={handleTrain}
            disabled={trainMutation.isPending}
          >
            <BrainCircuit className="h-4 w-4" />
            {trainMutation.isPending ? "Training..." : "Retrain Model"}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Price"
          value={`€${latestPrice.toFixed(2)}`}
          trend={priceTrend}
          trendValue={`${Math.abs(priceChange).toFixed(2)}%`}
          icon={<Euro className="h-5 w-5" />}
          description="Last closing price"
          isLoading={historyLoading}
        />
        <MetricCard
          title="Forecast Trend"
          value={forecastTrend === "up" ? "Bullish" : "Bearish"}
          trend={forecastTrend}
          trendValue="30 Days"
          icon={<TrendingUp className="h-5 w-5" />}
          description="Predicted market direction"
          isLoading={forecastLoading}
        />
        <MetricCard
          title="Model Accuracy"
          value={accuracy}
          trend="up"
          trendValue="+1.2%"
          icon={<Target className="h-5 w-5" />}
          description="RMSE vs previous window"
        />
        <MetricCard
          title="Latest Data"
          value={history && history.length > 0 ? format(new Date(history[history.length - 1].date), "MMM d") : "--"}
          icon={<Calendar className="h-5 w-5" />}
          description="Last sync timestamp"
          isLoading={historyLoading}
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Price Forecast Analysis</h2>
            
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
              <button 
                onClick={() => setModelType('SARIMAX')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  modelType === 'SARIMAX' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                SARIMAX
              </button>
              <button 
                onClick={() => setModelType('XGBoost')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  modelType === 'XGBoost' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                XGBoost
              </button>
            </div>
          </div>
          
          {historyError ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="font-semibold text-destructive">Failed to load chart data</h3>
              <p className="text-sm text-destructive/80 mt-1 max-w-md">
                There was an error fetching the carbon price history. Please try syncing data again.
              </p>
              <Button variant="outline" className="mt-4 border-destructive/20 hover:bg-destructive/10" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <ForecastChart 
              history={history || []} 
              forecast={forecast || []} 
              isLoading={historyLoading || forecastLoading} 
            />
          )}
        </div>
      </div>
      
      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold font-display mb-4">Market Factors</h3>
          <div className="space-y-4">
            {[
              { label: "Gas Prices", impact: "High", trend: "up" },
              { label: "Renewable Output", impact: "Medium", trend: "down" },
              { label: "Policy Updates", impact: "High", trend: "neutral" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="font-medium text-sm">{item.label}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.impact === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.impact} Impact
                  </span>
                  {item.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                  {item.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-rose-500" />}
                  {item.trend === 'neutral' && <Minus className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold font-display mb-4">System Alerts</h3>
          <div className="space-y-4">
             <div className="flex gap-4 items-start">
               <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
               <div>
                 <p className="text-sm font-medium">Prediction Model Updated</p>
                 <p className="text-xs text-muted-foreground mt-0.5">The SARIMAX model was retrained successfully 2 hours ago with new accuracy improvements.</p>
               </div>
             </div>
             <div className="flex gap-4 items-start">
               <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
               <div>
                 <p className="text-sm font-medium">Data Sync Scheduled</p>
                 <p className="text-xs text-muted-foreground mt-0.5">Automated EU ETS data sync is scheduled for 18:00 CET today.</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional import for icons used in the Market Factors card
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
