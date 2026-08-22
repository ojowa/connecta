import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} {...props} />;
}

function badgeVariant(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-800 border-green-200";
    case "suspended": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "banned": return "bg-red-100 text-red-800 border-red-200";
    case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
    case "resolved": return "bg-green-100 text-green-800 border-green-200";
    case "reviewed": return "bg-purple-100 text-purple-800 border-purple-200";
    case "dismissed": return "bg-gray-100 text-gray-800 border-gray-200";
    case "escalated": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export { Badge, badgeVariant };
