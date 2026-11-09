import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useCarbonHistory() {
  return useQuery({
    queryKey: [api.carbon.history.path],
    queryFn: async () => {
      const res = await fetch(api.carbon.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch carbon history");
      return api.carbon.history.responses[200].parse(await res.json());
    },
  });
}

export function useSyncCarbonData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.carbon.sync.path, {
        method: api.carbon.sync.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to sync carbon data");
      return api.carbon.sync.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.carbon.history.path] });
    },
  });
}

export function useForecast(days: number = 30) {
  return useQuery({
    queryKey: [api.predictions.forecast.path, days],
    queryFn: async () => {
      const url = `${api.predictions.forecast.path}?days=${days}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return api.predictions.forecast.responses[200].parse(await res.json());
    },
  });
}

export function useTrainModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (modelType: 'SARIMAX' | 'XGBoost' = 'SARIMAX') => {
      const input = api.predictions.train.input.parse({ modelType });
      const res = await fetch(api.predictions.train.path, {
        method: api.predictions.train.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to train model");
      return api.predictions.train.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.predictions.forecast.path] });
    },
  });
}
