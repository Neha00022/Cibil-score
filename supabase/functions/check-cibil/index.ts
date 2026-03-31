import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  name: z.string().min(1).max(255),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  email: z.string().email().optional().or(z.literal("")),
});

function generateMockCibilScore() {
  const score = Math.floor(Math.random() * 301) + 600; // 600-900
  let report: string;
  if (score >= 750) report = "Good";
  else if (score >= 650) report = "Average";
  else report = "Poor";
  return { score, report };
}

async function logHistory(supabase: any, pan: string, score: number, report: string, source: string) {
  await supabase.from("cibil_history").insert({
    pan,
    cibil_score: score,
    report,
    source,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, pan, email } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check for existing record
    const { data: existing } = await supabase
      .from("cibil_records")
      .select("*")
      .eq("pan", pan)
      .maybeSingle();

    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

    if (existing) {
      const age = Date.now() - new Date(existing.last_fetched).getTime();
      if (age < FIVE_DAYS_MS) {
        // Log cache hit to history
        await logHistory(supabase, pan, existing.cibil_score, existing.report, "cache");

        return new Response(
          JSON.stringify({
            cached: true,
            name: existing.name,
            pan: existing.pan,
            cibilScore: existing.cibil_score,
            report: existing.report,
            lastFetched: existing.last_fetched,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Cache expired — generate new score
      const { score, report } = generateMockCibilScore();
      await new Promise((r) => setTimeout(r, 1500));

      const { error } = await supabase
        .from("cibil_records")
        .update({
          name,
          email: email || null,
          cibil_score: score,
          report,
          last_fetched: new Date().toISOString(),
        })
        .eq("pan", pan);

      if (error) throw error;

      // Log to history
      await logHistory(supabase, pan, score, report, "api");

      return new Response(
        JSON.stringify({
          cached: false,
          name,
          pan,
          cibilScore: score,
          report,
          lastFetched: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // New record
    const { score, report } = generateMockCibilScore();
    await new Promise((r) => setTimeout(r, 1500));

    const { error } = await supabase.from("cibil_records").insert({
      name,
      pan,
      email: email || null,
      cibil_score: score,
      report,
    });

    if (error) throw error;

    // Log to history
    await logHistory(supabase, pan, score, report, "api");

    return new Response(
      JSON.stringify({
        cached: false,
        name,
        pan,
        cibilScore: score,
        report,
        lastFetched: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
