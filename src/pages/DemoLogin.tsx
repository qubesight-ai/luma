import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type DemoError = { code: string; message: string };

async function callDemo(check: boolean): Promise<any> {
  const { data, error } = await supabase.functions.invoke("demo-login", {
    method: "POST",
    body: { check },
  });
  if (error) {
    // Non-2xx: read the JSON body from the response
    try {
      const ctx = (error as any).context;
      if (ctx?.json) return await ctx.json();
    } catch { /* ignore */ }
    return { ok: false, code: "unreachable", error: "Could not reach the demo service." };
  }
  return data;
}

const DemoLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<DemoError | null>(null);
  const [status, setStatus] = useState("Checking demo account setup...");

  const run = useCallback(async () => {
    setError(null);
    try {
      setStatus("Checking demo account setup...");
      const check = await callDemo(true);
      if (!check?.ok) {
        setError({ code: check?.code ?? "unknown", message: check?.error ?? "Demo setup check failed." });
        return;
      }

      setStatus("Loading demo...");
      const data = await callDemo(false);
      if (!data?.access_token) {
        setError({ code: data?.code ?? "unknown", message: data?.error ?? "Demo sign-in failed." });
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError) {
        setError({ code: "session", message: "Signed in, but the demo session could not be started." });
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login failed:", err);
      setError({ code: "unknown", message: "Unexpected error while loading the demo." });
    }
  }, [navigate]);

  useEffect(() => { run(); }, [run]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {error ? (
        <div className="max-w-md w-full rounded-lg border border-destructive/50 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <h1 className="font-semibold">Demo account setup problem</h1>
          </div>
          <p className="text-foreground">{error.message}</p>
          <p className="text-xs text-muted-foreground">Error code: {error.code}</p>
          <div className="flex gap-2">
            <Button onClick={run}>Check again</Button>
            <Button variant="outline" asChild><Link to="/auth">Back to sign in</Link></Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{status}</p>
        </div>
      )}
    </div>
  );
};

export default DemoLogin;
