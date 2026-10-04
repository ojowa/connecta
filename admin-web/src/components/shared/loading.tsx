"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loading({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-12", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
