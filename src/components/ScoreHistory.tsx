import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreTrendChart } from "./ScoreTrendChart";
import { format } from "date-fns";

interface HistoryRecord {
  id: string;
  cibil_score: number;
  report: string;
  source: string;
  checked_at: string;
}

function getScoreDot(score: number) {
  if (score >= 750) return "bg-score-good";
  if (score >= 650) return "bg-score-average";
  return "bg-score-poor";
}

export function ScoreHistory({ pan }: { pan: string }) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("cibil_history")
        .select("*")
        .eq("pan", pan)
        .order("checked_at", { ascending: false })
        .limit(20);
      setHistory((data as HistoryRecord[]) || []);
      setLoading(false);
    };
    fetchHistory();
  }, [pan]);

  if (loading) {
    return (
      <Card className="w-full max-w-md border-brand/20">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Loading history…
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) return null;

  return (
    <>
      <ScoreTrendChart history={history} />

      <Card className="w-full max-w-md border-brand/20 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Check History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${getScoreDot(record.cibil_score)}`} />
                  <div>
                    <span className="font-semibold text-foreground text-sm">
                      {record.cibil_score}
                    </span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {record.report}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(record.checked_at), "dd MMM yyyy")}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {record.source === "cache" ? "Cached" : "API"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
