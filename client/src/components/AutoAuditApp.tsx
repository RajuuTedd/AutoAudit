import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StarBorder } from "@/components/ui/star-border";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import {
  Loader2,
  Shield,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradualSpacing } from "@/components/ui/gradual-spacing";
import GradientText from "./GradientText";


interface ReportData {
  reportGeneratedAt: string;
  url: string;
  summary: {
    passed: number;
    failed: number;
    errors: number;
    total: number;
    // Optional backend-provided fields used in the Scan Summary card
    totalTests?: number;
    totalFailures?: number;
    regulationBreakdown?: Record<string, { name?: string; failures: number }>;
  };
  violations: Array<{
    requirement: {
      id: string;
      name?: string;
      description: string;
      severity_default?: string;
      fix_suggestion?: string;
    };
    rules: Array<{
      id: string;
      title?: string;
      article_number?: string;
      description?: string;
      regulation?: { id: string; name?: string };
    }>;
    findings: Array<{
      findingId: string;
      tool?: string;
      severity?: string;
      reason?: string;
      evidence?: Array<{ key: string; value: string }>;
    }>;
  }>;
  tests: Array<{
    testId?: string;
    testName: string;
    status: "PASS" | "FAIL" | "ERROR";
    details: any;
  }>;
}

function transformBackendToReportData(resp: any, url: string): ReportData {
  const requirementStatuses = Array.isArray(resp?.requirementStatuses)
    ? resp.requirementStatuses
    : [];
  const violations = Array.isArray(resp?.violations) ? resp.violations : [];

  // Prefer backend requirementStatuses for accurate PASS/FAIL/TOTAL; fallback to violations if missing
  let passCount = 0;
  let failCount = 0;
  let errorCount = 0;
  let total = 0;

  if (requirementStatuses.length > 0) {
    passCount = requirementStatuses.filter((r: any) => r.status === "PASS").length;
    failCount = requirementStatuses.filter((r: any) => r.status === "FAIL").length;
    errorCount = requirementStatuses.filter((r: any) => r.status === "ERROR").length;
    total = requirementStatuses.length; // total requirements evaluated
  }
  // } else {
  //   // Fallback: derive from violations only (unique requirement ids)
  //   const uniqueFailReqIds = Array.from(
  //     new Set(
  //       violations
  //         .map((v: any) => v?.requirement?.id)
  //         .filter((id: any): id is string => Boolean(id))
  //     )
  //   );
  //   failCount = uniqueFailReqIds.length;
  //   errorCount = 0;
  //   passCount = 0;
  //   total = failCount;
  // }

  return {
    reportGeneratedAt: new Date().toISOString(),
    url,
    summary: {
      passed: passCount,
      failed: failCount,
      errors: errorCount,
      total: total,
      ...(resp?.summary || {}),
    },
    // Pass through violations in the new shape (requirement/rules/findings)
    violations: violations,
    tests: requirementStatuses.map((r: any) => ({
      testId: r.requirementId,
      testName: r.requirementName || r.requirementId,
      status: r.status === "PASS" ? "PASS" : r.status === "FAIL" ? "FAIL" : "ERROR",
      details: r.failures || {},
    })),
  };
}

const AutoAuditApp: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setReportData(null);

    try {
      // FIX: Replace the simulated API call with the real backend endpoint.
      const response = await fetch("http://localhost:3000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: url.trim() })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const raw = await response.json();
      console.log(raw)
      setReportData(transformBackendToReportData(raw, url));
    } catch (error) {
      console.error("Audit failed:", error);
      // Optional: Set a specific error message in the state for display.
      setReportData({
        reportGeneratedAt: new Date().toISOString(),
        url: url,
        summary: { passed: 0, failed: 0, errors: 1, total: 1 },
        violations: [
          {
            requirement: {
              id: "error",
              description: "Failed to connect to the server or process the request.",
              severity_default: "ERROR",
              fix_suggestion: "Please ensure the backend is running and the URL is valid."
            },
            rules: [],
            findings: []
          },
        ],
        tests: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "FAIL":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PASS: "bg-success/10 text-success border-success/20",
      FAIL: "bg-destructive/10 text-destructive border-destructive/20",
      ERROR: "bg-warning/10 text-warning border-warning/20",
    };

    return (
      <Badge
        variant="outline"
        className={variants[status as keyof typeof variants] || "bg-muted/10"}
      >
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.5}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-primary/20 stroke-primary/20"
        )}
      />

      <nav className="fixed top-4 left-4 right-4 z-50 glass glass-shadow rounded-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AutoAudit
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-fast"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-fast"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-fast"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="leading-tight flex flex-wrap justify-center gap-x-2">
                  {/* "Web" */}
                  <GradualSpacing text="Web" />

                  {/* "Compliance" with gradient */}
                  <GradientText
                    colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff"]}
                    animationSpeed={3}
                    showBorder={false}
                    className="font-bold tracking-tighter text-5xl sm:text-6xl lg:text-7xl"
                  >
                    <GradualSpacing text="Compliance" />
                  </GradientText>

                  {/* "Made Simple" */}
                  <GradualSpacing text="Made Simple" />
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Automatically audit your website for GDPR, accessibility, and
                  security compliance. Get actionable insights in seconds, not
                  hours.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>WCAG Standards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Security Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Privacy policy analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Start Your Audit</h2>
              <p className="text-muted-foreground">
                Enter your website URL to begin a comprehensive compliance scan
              </p>
            </div>

            {!isLoading && !reportData && (
              <Card className="glass glass-shadow border-border/50">
                <CardContent className="p-8">
                  <form onSubmit={handleScan} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="url" className="text-sm font-medium">
                        Website URL
                      </label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-lg glass border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>
                    <StarBorder
                      as="button"
                      type="submit"
                      className="w-full"
                      color="hsl(var(--primary))"
                      speed="4s"
                      disabled={!url.trim()}
                    >
                      <div className="flex items-center justify-center space-x-2 text-lg font-semibold">
                        <Search className="h-5 w-5" />
                        <span>Scan Website</span>
                      </div>
                    </StarBorder>
                  </form>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <Card className="glass glass-shadow border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="space-y-6">
                    <div className="pulse-glow mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        Running compliance audit...
                      </h3>
                      <p className="text-muted-foreground">
                        This may take a moment while we analyze your website
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {reportData && (
              <div className="space-y-6">
                {/* Scan Summary (URL + Backend Summary) */}
                <Card className="glass glass-shadow border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Scan Summary</span>
                      <span className="text-sm font-normal text-muted-foreground">{new Date(reportData.reportGeneratedAt).toLocaleString()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scanned URL */}
                    <div>
                      <div className="text-sm text-muted-foreground">Scanned URL</div>
                      <div className="text-base font-medium break-all">{reportData.url}</div>
                    </div>

                    {(() => {
                      const backendSummary: any = (reportData as any).summary || {};
                      const regulationBreakdown = backendSummary.regulationBreakdown || {};

                      return (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Regulation Breakdown</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(regulationBreakdown).length === 0 && (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                            {Object.entries(regulationBreakdown).map(([key, val]: any, idx) => (
                              <div key={`${key}-${idx}`} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/40 bg-muted/30">
                                <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold">{String(key).toUpperCase()}</Badge>
                                <span className="text-sm font-medium">{val?.name || ""}</span>
                                <span className="text-xs text-muted-foreground">• Failures: {val?.failures ?? 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
                {/* Compliance Issues Table */}
                <Card className="glass glass-shadow border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span>Compliance Issues</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table className="w-full min-w-[1200px]">
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="w-[20%]">Requirement</TableHead>
                          <TableHead className="w-[5%]">Regulation</TableHead>
                          <TableHead className="w-[35%]">Rule</TableHead>
                          <TableHead className="w-[15%]">Findings</TableHead>
                          <TableHead className="w-[5%] text-center">Severity</TableHead>
                          <TableHead className="w-[30%]">Suggested Fix</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
  {(reportData.violations && reportData.violations.length > 0
    ? reportData.violations
    : []
  ).map((v, index) => {
    const rulesList = Array.isArray(v.rules) ? v.rules : [];

    // Build a de-duplicated list of finding reasons (case-insensitive), preserving first wording
    const seen = new Set<string>();
    const uniqueReasons: string[] = [];
    for (const f of (v.findings || [])) {
      const reason = (f.reason || "").trim();
      if (!reason) continue;
      const key = reason.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueReasons.push(reason);
      }
    }

    return (
      <TableRow key={index} className="border-border/30 align-top hover:bg-muted/30">
        {/* Requirement description */}
        <TableCell className="font-medium whitespace-pre-wrap align-top">
          <div className="space-y-1">
            <div>{v.requirement?.description || v.requirement?.name || v.requirement?.id}</div>
          </div>
        </TableCell>

        {/* Regulations aligned with respective rules (stacked like Rule column) */}
        <TableCell className="align-center">
          <div className="space-y-12">
            {rulesList.length === 0 && (
              <div className="text-muted-foreground text-sm">N/A</div>
            )}
            {rulesList.map((r, i) => {
              const regId = r?.regulation?.id;
              let colorClass = "bg-gray-200 text-gray-800";
              const txt = (regId || "").toLowerCase();
              if (txt.includes("gdpr")) colorClass = "bg-blue-100 text-blue-800";
              if (txt.includes("dpdp")) colorClass = "bg-green-100 text-green-800";
              if (txt.includes("wcag")) colorClass = "bg-purple-100 text-purple-800";
              if (txt.includes("hipaa")) colorClass = "bg-red-100 text-red-800";
              return (
                <div key={(r.id || i) + "-reg"} className="p-2 rounded-md border border-border/40 bg-muted/40 flex items-start">
                  {regId ? (
                    <Badge className={cn("px-2 py-0.5 text-xs font-medium rounded-md", colorClass)}>
                      {String(regId).toUpperCase()}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </div>
              );
            })}
          </div>
        </TableCell>

        {/* Rules: article_number (badge) + title (on next line), stack for clarity */}
        <TableCell className="align-top">
          <div className="space-y-2">
            {(v.rules || []).length === 0 && (
              <div className="text-muted-foreground text-sm">N/A</div>
            )}
            {(v.rules || []).map((r, i) => (
              <div key={r.id || i} className="p-2 rounded-md border border-border/40 bg-muted/40 min-h-[72px] flex flex-col justify-start">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <Badge variant="outline" className="px-2 py-0.5">
                    Article: {r.article_number || "—"}
                  </Badge>
                </div>
                <div className="text-sm font-medium leading-snug">
                  {r.title || "Untitled rule"}
                </div>
                {r.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {r.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TableCell>

        {/* Findings: unique reasons (stacked) */}
        <TableCell className="align-top">
          <div className="space-y-1">
            {uniqueReasons.length === 0 && (
              <div className="text-muted-foreground text-sm">N/A</div>
            )}
            {uniqueReasons.map((reason, i) => (
              <div key={i} className="text-sm">
                {reason}
              </div>
            ))}
          </div>
        </TableCell>

        {/* Severity: requirement.severity_default */}
        <TableCell className="text-center align-top">
          {v.requirement?.severity_default ? (
            <Badge variant="outline" className="px-2 py-1">
              {String(v.requirement.severity_default).toUpperCase()}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">N/A</span>
          )}
        </TableCell>

        {/* Suggested Fix: requirement.fix_suggestion */}
        <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap align-top">
          {v.requirement?.fix_suggestion || "See requirement details and apply the recommended fix."}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Button */}
                <div className="text-center">
                  <Button
                    onClick={() => {
                      setReportData(null);
                      setUrl("");
                    }}
                    variant="outline"
                    className="glass border-border/50 hover:bg-primary/10"
                  >
                    Scan Another Website
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AutoAuditApp;
