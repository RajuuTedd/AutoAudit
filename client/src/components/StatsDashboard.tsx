import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

declare const Chart: any;

const loadChartJS = () =>
  new Promise<void>((resolve) => {
    if ((window as any).Chart) return resolve();
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });

const KPI = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="rounded-lg p-4" style={{ background: "var(--muted)" }}>
    <p
      className="text-[11px] font-semibold tracking-widest uppercase mb-2"
      style={{ color: "var(--muted-foreground)" }}
    >
      {label}
    </p>
    <p
      className="text-3xl font-bold leading-none"
      style={{ color: color || "var(--foreground)" }}
    >
      {value}
    </p>
  </div>
);

const OverlapBar = ({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <div
      className="flex justify-between text-xs"
      style={{ color: "var(--muted-foreground)" }}
    >
      <span>{label}</span>
      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
        {pct}%
      </span>
    </div>
    <div
      className="h-1.5 rounded-full w-full"
      style={{ background: "var(--muted)" }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  </div>
);

export const StatsDashboard = () => {
  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barInstance = useRef<any>(null);
  const donutInstance = useRef<any>(null);

  useEffect(() => {
    loadChartJS().then(() => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      const tickColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

      if (barRef.current) {
        barInstance.current?.destroy();
        barInstance.current = new Chart(barRef.current, {
          type: "bar",
          data: {
            labels: ["GDPR", "DPDP", "WCAG"],
            datasets: [
              {
                data: [11, 10, 1],
                backgroundColor: ["#378add", "#7f77dd", "#1d9e75"],
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: { label: (ctx: any) => ` ${ctx.parsed.y} findings` },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: tickColor,
                  font: { family: "Space Grotesk, sans-serif", size: 12 },
                },
                border: { display: false },
              },
              y: {
                grid: { color: gridColor },
                ticks: {
                  color: tickColor,
                  font: { family: "Space Grotesk, sans-serif", size: 11 },
                  stepSize: 2,
                },
                border: { display: false },
                beginAtZero: true,
              },
            },
          },
        });
      }

      if (donutRef.current) {
        donutInstance.current?.destroy();
        donutInstance.current = new Chart(donutRef.current, {
          type: "doughnut",
          data: {
            labels: ["Critical/High", "Medium", "Low"],
            datasets: [
              {
                data: [15, 8, 3],
                backgroundColor: ["#e24b4a", "#ef9f27", "#378add"],
                borderWidth: 0,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: any) =>
                    ` ${ctx.parsed} findings (${Math.round((ctx.parsed / 26) * 100)}%)`,
                },
              },
            },
          },
        });
      }
    });

    return () => {
      barInstance.current?.destroy();
      donutInstance.current?.destroy();
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Total violations" value={26} />
        <KPI label="Critical / High" value={15} color="#e24b4a" />
        <KPI label="Medium" value={8} color="#ef9f27" />
        <KPI label="Low risk" value={3} color="#378add" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-border/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-[13px] font-semibold tracking-widest uppercase text-muted-foreground">
              Violation density by regulation
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Total findings mapped per framework
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 flex-wrap">
              {[
                ["#378add", "GDPR 11"],
                ["#7f77dd", "DPDP 10"],
                ["#1d9e75", "WCAG 1"],
              ].map(([c, l]) => (
                <span
                  key={l}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: c }}
                  />
                  {l}
                </span>
              ))}
            </div>
            <div className="relative w-full h-[220px]">
              <canvas
                ref={barRef}
                role="img"
                aria-label="Bar chart: GDPR 11, DPDP 10, WCAG 1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-[13px] font-semibold tracking-widest uppercase text-muted-foreground">
              Risk profile by severity
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Distribution across risk tiers
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 flex-wrap">
              {[
                ["#e24b4a", "Critical/High 58%"],
                ["#ef9f27", "Medium 31%"],
                ["#378add", "Low 11%"],
              ].map(([c, l]) => (
                <span
                  key={l}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: c }}
                  />
                  {l}
                </span>
              ))}
            </div>
            <div className="relative w-full h-[220px]">
              <canvas
                ref={donutRef}
                role="img"
                aria-label="Donut: Critical/High 58%, Medium 31%, Low 11%"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insight card */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-center py-4">
              <p
                className="text-7xl font-bold leading-none tracking-tighter"
                style={{ color: "#378add" }}
              >
                90%
              </p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs mx-auto">
                of technical failures triggered violations in{" "}
                <span className="font-semibold text-foreground">
                  both GDPR and DPDP
                </span>{" "}
                simultaneously
              </p>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/40 md:pl-8 pt-6 md:pt-0">
              <OverlapBar
                label="Shared — GDPR + DPDP"
                pct={90}
                color="#378add"
              />
              <OverlapBar label="Unique to GDPR" pct={5} color="#7f77dd" />
              <OverlapBar label="Unique to DPDP" pct={5} color="#1d9e75" />
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-3 border-t border-border/40">
                SSL hygiene, cookie consent, and HSTS failures account for the
                shared majority — confirming technical compliance is a universal
                requirement across global privacy frameworks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
