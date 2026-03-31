import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HistoryRecord {
  id: string;
  cibil_score: number;
  report: string;
  source: string;
  checked_at: string;
}

export function ScoreTrendChart({ history }: { history: HistoryRecord[] }) {
  // Need at least 2 points for a meaningful chart
  if (history.length < 2) return null;

  // Reverse so oldest is first (left side of chart)
  const chartData = [...history]
    .reverse()
    .map((r) => ({
      date: format(new Date(r.checked_at), "dd MMM"),
      score: r.cibil_score,
      fullDate: format(new Date(r.checked_at), "dd MMM yyyy, HH:mm"),
    }));

  return (
    <Card className="w-full max-w-md border-brand/20 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">Score Trend</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[300, 900]}
              ticks={[300, 500, 650, 750, 900]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={750}
              stroke="hsl(var(--score-good))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={650}
              stroke="hsl(var(--score-average))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                    <p className="text-xs text-muted-foreground">{d.fullDate}</p>
                    <p className="text-sm font-heading font-bold text-foreground">
                      Score: {d.score}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--brand))"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{
                r: 4,
                fill: "hsl(var(--brand))",
                stroke: "hsl(var(--card))",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "hsl(var(--brand))",
                stroke: "hsl(var(--card))",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-score-good rounded" /> 750+ Good
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-score-average rounded" /> 650 Average
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
