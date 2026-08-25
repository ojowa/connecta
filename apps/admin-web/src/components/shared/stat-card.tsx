import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  format?: "number" | "currency";
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, format = "number", icon: Icon, description, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'string' ? value : format === "currency" ? formatCurrency(value) : formatNumber(value)}
            </p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
