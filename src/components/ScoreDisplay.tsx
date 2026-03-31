import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ScoreGauge } from "./ScoreGauge";

interface ScoreDisplayProps {
  name: string;
  pan: string;
  cibilScore: number;
  report: string;
  lastFetched: string;
  cached: boolean;
}

function getReportBadgeClass(report: string) {
  if (report === "Good") return "bg-score-good/15 text-score-good border-score-good/30";
  if (report === "Average") return "bg-score-average/15 text-score-average border-score-average/30";
  return "bg-score-poor/15 text-score-poor border-score-poor/30";
}

export function ScoreDisplay({ name, pan, cibilScore, report, lastFetched, cached }: ScoreDisplayProps) {
  const timeAgo = formatDistanceToNow(new Date(lastFetched), { addSuffix: true });

  return (
    <Card className="w-full max-w-md border-brand/20 shadow-brand animate-fade-in">
      <CardContent className="pt-8 pb-6 text-center space-y-5">
        {cached && (
          <div className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
            📋 Showing cached result (last updated {timeAgo})
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-1">Score for</p>
          <p className="text-lg font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{pan}</p>
        </div>

        <div className="flex justify-center">
          <ScoreGauge score={cibilScore} />
        </div>

        <Badge variant="outline" className={`text-sm px-4 py-1 ${getReportBadgeClass(report)}`}>
          {report}
        </Badge>

        <p className="text-xs text-muted-foreground">
          Last fetched: {new Date(lastFetched).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
