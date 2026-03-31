import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CibilForm } from "@/components/CibilForm";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ScoreHistory } from "@/components/ScoreHistory";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CibilResult {
  cached: boolean;
  name: string;
  pan: string;
  cibilScore: number;
  report: string;
  lastFetched: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CibilResult | null>(null);

  const handleSubmit = async (data: { name: string; pan: string; email: string }) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data: res, error } = await supabase.functions.invoke("check-cibil", {
        body: data,
      });

      if (error) throw error;
      setResult(res);

      if (res.cached) {
        toast.info("Showing cached result from a recent check.");
      } else {
        toast.success("CIBIL Score fetched successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch CIBIL score. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-brand-foreground font-heading text-sm">CS</span>
          </div>
          <h1 className="text-lg font-heading text-foreground">CIBIL Score Checker</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-brand" />
            <p className="text-muted-foreground">Fetching your CIBIL score…</p>
            <p className="text-xs text-muted-foreground">Simulating TransUnion API call</p>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <ScoreDisplay {...result} />
            <ScoreHistory pan={result.pan} />
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="text-muted-foreground"
            >
              Check Another PAN
            </Button>
          </div>
        ) : (
          <CibilForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Scores are simulated for demonstration purposes. 5-day caching is active.
      </footer>
    </div>
  );
};

export default Index;
