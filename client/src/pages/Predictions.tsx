import { useForecast } from "@/hooks/use-carbon-data";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Predictions() {
  const { data: forecast, isLoading } = useForecast(30);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          Detailed Forecasts
        </h1>
        <p className="text-muted-foreground mt-1">
          Machine learning price predictions for the next 30 days.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prediction Data Table</CardTitle>
          <CardDescription>
            Showing predicted close prices with 95% confidence intervals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Predicted Price</TableHead>
                  <TableHead>Lower Bound (95%)</TableHead>
                  <TableHead>Upper Bound (95%)</TableHead>
                  <TableHead>Model Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-24 animate-pulse bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 animate-pulse bg-muted rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : forecast?.length === 0 ? (
                   <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No forecast data available. Train the model to generate predictions.
                    </TableCell>
                  </TableRow>
                ) : (
                  forecast?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium font-mono">
                        {format(new Date(item.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        €{item.predictedPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        €{item.lowerBound?.toFixed(2) ?? '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        €{item.upperBound?.toFixed(2) ?? '-'}
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                           High
                         </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
