import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  description?: string;
  className?: string;
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  description,
  className,
  isLoading = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground font-display uppercase tracking-wider">
          {title}
        </p>
        {icon && <div className="text-primary opacity-80">{icon}</div>}
      </div>

      <div className="mt-4 flex items-baseline">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
        ) : (
          <h3 className="text-3xl font-bold tracking-tight text-foreground font-display">
            {value}
          </h3>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-2 flex items-center text-sm">
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1 font-medium rounded-full px-2 py-0.5 text-xs",
                trend === "up" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                trend === "down" && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                trend === "neutral" && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              {trendValue}
            </span>
          )}
          {description && (
            <span className="ml-2 text-muted-foreground">{description}</span>
          )}
        </div>
      )}
      
      {/* Decorative gradient overlay */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}
