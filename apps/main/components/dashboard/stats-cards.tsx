import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { DollarSign, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardMetrics } from "@/lib/types";

interface StatsCardsProps {
  metrics: DashboardMetrics;
  dateRange?: string;
}

export default function StatsCards({ metrics, dateRange = "monthly" }: StatsCardsProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const periodLabel = dateRange === "all-time" ? "All Time" : "This Month";

  const stats = [
    {
      title: "Total Outstanding",
      value: formatCurrency(metrics.totalOutstanding),
      description: "Pending invoices value",
      icon: DollarSign,
    },
    {
      title: `Invoices ${periodLabel}`,
      value: metrics.invoicesThisMonth.toString(),
      description: "Total processed",
      icon: FileText,
    },
    {
      title: "Pending Review",
      value: metrics.pendingThisMonth.toString(),
      description: "Awaiting approval",
      icon: Clock,
    },
    {
      title: `Approved ${periodLabel}`,
      value: metrics.approvedThisMonth.toString(),
      description: "Successfully processed",
      icon: CheckCircle,
    },
    {
      title: `Rejected ${periodLabel}`,
      value: metrics.rejectedThisMonth.toString(),
      description: "Requires attention",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}