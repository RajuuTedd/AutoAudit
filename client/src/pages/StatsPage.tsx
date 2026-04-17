import { StatsDashboard } from "@/components/StatsDashboard";
import { Shield, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const StatsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Research Insights</h1>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl text-muted-foreground">
            Aggregate Compliance Data across Scanned Websites
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            This dashboard displays patterns identified during the automated
            auditing of multiple targets. It highlights the correlation between
            technical failures and regulatory non-compliance.
          </p>
        </div>

        <StatsDashboard />
      </div>
    </div>
  );
};
