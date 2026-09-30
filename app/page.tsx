import { loadWorkspace } from "@/lib/data/reconciliation";
import Workspace from "@/components/workspace";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ run?: string }> }) {
  try {
    const { run } = await searchParams;
    return <Workspace {...(await loadWorkspace(run))} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The reconciliation workspace could not be loaded.";
    const unavailable = message.includes("schema cache") || message.includes("Could not find the table");
    return <main className="system-page"><div className="system-card"><span className="eyebrow">BANK RECONCILIATION</span><h1>{unavailable ? "Database setup is required" : "Workspace unavailable"}</h1><p>{unavailable ? "The app is connected to Supabase, but its reconciliation tables have not been installed yet. Apply supabase/migrations/0001_init.sql in the Supabase SQL editor." : message}</p></div></main>;
  }
}
