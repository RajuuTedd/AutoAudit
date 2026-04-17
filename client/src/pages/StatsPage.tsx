import { StatsDashboard } from "@/components/StatsDashboard";
import { Shield, ChevronLeft, Database, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const StatsPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-50"
        style={{
          background:
            "linear-gradient(90deg, #4079ff 0%, #7c3aed 50%, #06b6d4 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-12">
        {/* ── Navigation ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm transition-all group"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="group-hover:underline underline-offset-4">
              Back to audit
            </span>
          </button>
        </div>

        {/* ── Hero header ── */}
        <div className="space-y-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase"
            style={{
              borderColor: "rgba(64,121,255,0.3)",
              background: "rgba(64,121,255,0.06)",
              color: "#4079ff",
            }}
          >
            <Database className="h-3 w-3" />
            Neo4j · Static Graph Data
          </div>

          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-start gap-4">
              {/* Icon block */}
              <div
                className="mt-1 flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(64,121,255,0.15) 0%, rgba(124,58,237,0.15) 100%)",
                  border: "1px solid rgba(64,121,255,0.2)",
                }}
              >
                <Shield className="h-6 w-6" style={{ color: "#4079ff" }} />
              </div>

              <div>
                <h1
                  className="text-4xl font-bold tracking-tight leading-none"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "var(--foreground)",
                  }}
                >
                  Research Insights
                </h1>
                <p
                  className="mt-1 text-base"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Aggregate compliance patterns across all scanned websites
                </p>
              </div>
            </div>
          </div>

          {/* Description + stat pills row */}
          <div
            className="flex flex-col sm:flex-row sm:items-end gap-6 pt-2 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-sm leading-relaxed max-w-xl"
              style={{ color: "var(--muted-foreground)" }}
            >
              This dashboard surfaces patterns from the automated auditing
              pipeline — correlating technical failures (SSL, AXE, headers) with
              regulatory non-compliance mapped in the Neo4j knowledge graph.
            </p>

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <TrendingUp className="h-4 w-4" style={{ color: "#4079ff" }} />
              <span
                className="text-xs font-medium tracking-wide uppercase"
                style={{ color: "var(--muted-foreground)" }}
              >
                Research data · Read only
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider with label ── */}
        <div className="relative flex items-center gap-4">
          <div
            className="flex-1 h-px"
            style={{ background: "var(--border)" }}
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest px-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            Dashboard
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "var(--border)" }}
          />
        </div>

        {/* ── Main dashboard ── */}
        <StatsDashboard />
      </div>
    </div>
  );
};
