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
  };
  violations: Array<{
    requirement: string;
    related_rules: Array<{
      regulation: string;
      article: string;
      title: string;
    }>;
    regulations: string[];
    suggested_fix: string;
  }>;
  tests: Array<{
    testId?: string;
    testName: string;
    status: "PASS" | "FAIL" | "ERROR";
    details: any;
  }>;
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
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Audit failed:", error);
      // Optional: Set a specific error message in the state for display.
      setReportData({
        reportGeneratedAt: new Date().toISOString(),
        url: url,
        summary: { passed: 0, failed: 0, errors: 1, total: 1 },
        violations: [
          {
            requirement:
              "Failed to connect to the server or process the request.",
            related_rules: [],
            regulations: [],
            suggested_fix:
              "Please ensure the backend is running and the URL is valid.",
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
          <div className="max-w-2xl mx-auto">
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
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="glass glass-shadow border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-success">
                        {reportData.summary.passed}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Passed
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass glass-shadow border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {reportData.summary.failed}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Failed
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass glass-shadow border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-warning">
                        {reportData.summary.errors}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Errors
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass glass-shadow border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {reportData.summary.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Issues Table */}
                <Card className="glass glass-shadow border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span>Compliance Issues</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead>Requirement</TableHead>
                          <TableHead>Regulations</TableHead>
                          <TableHead>Suggested Fix</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.violations.map((violation, index) => (
                          <TableRow key={index} className="border-border/30">
                            <TableCell className="font-medium max-w-xs">
                              {violation.requirement}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {violation.regulations.map((reg, i) => {
                                  // Assign custom colors per regulation
                                  let colorClass = "bg-gray-200 text-gray-800";
                                  if (reg.toLowerCase().includes("gdpr"))
                                    colorClass = "bg-blue-100 text-blue-800";
                                  if (reg.toLowerCase().includes("dpdp"))
                                    colorClass = "bg-green-100 text-green-800";
                                  if (reg.toLowerCase().includes("wcag"))
                                    colorClass =
                                      "bg-purple-100 text-purple-800";
                                  if (reg.toLowerCase().includes("hipaa"))
                                    colorClass = "bg-red-100 text-red-800";

                                  return (
                                    <Badge
                                      key={i}
                                      className={cn(
                                        "px-2 py-1 text-sm font-medium rounded-md",
                                        colorClass
                                      )}
                                    >
                                      {reg}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-md text-sm text-muted-foreground">
                              {violation.suggested_fix}
                            </TableCell>
                          </TableRow>
                        ))}
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
