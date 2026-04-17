import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const regulationData = [
  { name: "GDPR", findings: 11 },
  { name: "DPDP", findings: 10 },
  { name: "WCAG", findings: 1 },
];

const severityData = [
  { name: "High/Critical", value: 15, color: "#ef4444" },
  { name: "Medium", value: 8, color: "#f59e0b" },
  { name: "Low", value: 3, color: "#3b82f6" },
];

const overlapData = [
  { name: "Shared (GDPR + DPDP)", value: 90 },
  { name: "Unique to GDPR", value: 5 },
  { name: "Unique to DPDP", value: 5 },
];

export const StatsDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* 1. Regulation Density Bar Chart */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Violation Density by Regulation</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regulationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888844" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
              />
              <Bar dataKey="findings" fill="#4079ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Severity Distribution Pie Chart */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Risk Profile (Severity)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Research Insight: Legal Overlap */}
      <Card className="glass border-border/50 md:col-span-2">
        <CardHeader>
          <CardTitle>The "Graph" Advantage: Multi-Regulation Impact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-around">
          <div className="text-center space-y-2 max-w-sm">
            <h4 className="text-4xl font-bold text-primary">90%</h4>
            <p className="text-muted-foreground">
              of technical failures found in our audit triggered violations in
              <strong> both GDPR and DPDP</strong> frameworks simultaneously.
            </p>
          </div>
          <div className="h-[200px] w-full md:w-1/2">
            {/* You can add another chart here or a descriptive table */}
            <div className="bg-muted/20 p-4 rounded-lg border border-border/40 text-sm">
              <strong>Paper Insight:</strong> This high overlap confirms that
              technical hygiene (SSL, Cookies, HSTS) is a universal requirement
              across global privacy laws.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
