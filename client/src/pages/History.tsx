import { useCarbonHistory } from "@/hooks/use-carbon-data";
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
import { Loader2 } from "lucide-react";

export default function History() {
  const { data: history, isLoading } = useCarbonHistory();

  // Sort history by date descending for the table
  const sortedHistory = history ? [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          Historical Data
        </h1>
        <p className="text-muted-foreground mt-1">
          Archive of EU ETS carbon price settlements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>
            Official closing prices from the exchange.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Closing Price (€)</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead className="text-right">Daily Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedHistory.length === 0 ? (
                   <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No historical data found. Please sync data from the dashboard.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedHistory.map((item, index) => {
                    // Calculate change from next item (which is previous day in sorted array)
                    const prevItem = sortedHistory[index + 1];
                    const change = prevItem ? item.price - prevItem.price : 0;
                    const changePercent = prevItem ? (change / prevItem.price) * 100 : 0;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium font-mono">
                          {format(new Date(item.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          €{item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.volume ? item.volume.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(1)}%)
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
